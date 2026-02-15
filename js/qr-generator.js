// === QR-Code Generator Tool ===

// ─── Minimal QR Code Encoder (Byte mode, ECC level M, versions 1-40) ───

const QRCode = (() => {
    // Error correction codewords per block for level M (index = version-1)
    const EC_CODEWORDS_M = [
        10, 16, 26, 18, 24, 16, 18, 22, 22, 26,
        30, 22, 22, 24, 24, 28, 28, 26, 26, 26,
        26, 28, 28, 28, 28, 28, 28, 28, 28, 28,
        28, 28, 28, 28, 28, 28, 28, 28, 28, 28
    ];

    // Number of EC blocks for level M (index = version-1)
    // [numBlocks_group1, dcWords_group1, numBlocks_group2, dcWords_group2]
    const BLOCK_TABLE_M = [
        [1,16,0,0],[1,28,0,0],[1,44,0,0],[2,32,0,0],[2,43,0,0],
        [4,27,0,0],[4,31,0,0],[2,38,2,39],[3,36,2,37],[4,43,1,44],
        [1,50,4,51],[6,36,2,37],[6,37,2,38],[11,40,0,0],[5,41,5,42],
        [5,45,5,46],[1,46,9,47],[5,47,5,48],[3,48,7,49],[3,49,7,50],
        [4,50,7,51],[2,51,9,52],[7,54,1,55],[1,53,11,54],[11,54,2,55],
        [7,55,4,56],[13,52,4,53],[12,54,4,55],[12,55,4,56],[15,56,2,57],
        [11,57,5,58],[11,58,5,59],[7,59,7,60],[13,59,3,60],[12,60,5,61],
        [6,61,14,62],[17,58,4,59],[4,60,18,61],[20,60,4,61],[19,61,6,62]
    ];

    // Total data codewords for level M (index = version-1)
    const DATA_CODEWORDS_M = [
        16, 28, 44, 64, 86, 108, 124, 154, 182, 216,
        254, 290, 311, 338, 366, 395, 437, 450, 475, 504,
        541, 561, 592, 611, 661, 669, 714, 730, 766, 782,
        843, 868, 885, 936, 969, 1020, 1050, 1098, 1140, 1182
    ];

    // Alignment pattern positions (index = version-1, version 1 has none)
    const ALIGNMENT_POSITIONS = [
        [],
        [6,18],
        [6,22],
        [6,26],
        [6,30],
        [6,34],
        [6,22,38],
        [6,24,42],
        [6,26,46],
        [6,28,50],
        [6,30,54],
        [6,32,58],
        [6,34,62],
        [6,26,46,66],
        [6,26,48,70],
        [6,26,50,74],
        [6,30,54,78],
        [6,30,56,82],
        [6,30,58,86],
        [6,34,62,90],
        [6,28,50,72,94],
        [6,26,50,74,98],
        [6,30,54,78,102],
        [6,28,54,80,106],
        [6,32,58,84,110],
        [6,30,58,86,114],
        [6,34,62,90,118],
        [6,26,50,74,98,122],
        [6,30,54,78,102,126],
        [6,26,52,78,104,130],
        [6,30,56,82,108,134],
        [6,34,60,86,112,138],
        [6,30,58,86,114,142],
        [6,34,62,90,118,146],
        [6,30,54,78,102,126,150],
        [6,24,50,76,102,128,154],
        [6,28,54,80,106,132,158],
        [6,32,58,84,110,136,162],
        [6,26,54,82,110,138,166],
        [6,30,58,86,114,142,170]
    ];

    // Format info bits for ECC level M, mask 0-7
    const FORMAT_INFO_M = [
        0x5412, 0x5125, 0x5E7C, 0x5B4B,
        0x45F9, 0x40CE, 0x4F97, 0x4AA0
    ];

    // Version info bits for versions 7-40
    const VERSION_INFO = [
        0x07C94, 0x085BC, 0x09A99, 0x0A4D3, 0x0BBF6,
        0x0C762, 0x0D847, 0x0E60D, 0x0F928, 0x10B78,
        0x1145D, 0x12A17, 0x13532, 0x149A6, 0x15683,
        0x168C9, 0x177EC, 0x18EC4, 0x191E1, 0x1AFAB,
        0x1B08E, 0x1CC1A, 0x1D33F, 0x1ED75, 0x1F250,
        0x209D5, 0x216F0, 0x228BA, 0x2379F, 0x24B0B,
        0x2542E, 0x26A64, 0x27541, 0x28C69
    ];

    // GF(256) arithmetic for Reed-Solomon
    const GF_EXP = new Uint8Array(512);
    const GF_LOG = new Uint8Array(256);

    // Initialize GF tables
    let x = 1;
    for (let i = 0; i < 255; i++) {
        GF_EXP[i] = x;
        GF_LOG[x] = i;
        x = (x << 1) ^ (x & 128 ? 0x11D : 0);
    }
    for (let i = 255; i < 512; i++) {
        GF_EXP[i] = GF_EXP[i - 255];
    }

    function gfMul(a, b) {
        if (a === 0 || b === 0) return 0;
        return GF_EXP[GF_LOG[a] + GF_LOG[b]];
    }

    // Generate RS generator polynomial
    function rsGenPoly(nsym) {
        let g = [1];
        for (let i = 0; i < nsym; i++) {
            const ng = new Array(g.length + 1).fill(0);
            for (let j = 0; j < g.length; j++) {
                ng[j] ^= g[j];
                ng[j + 1] ^= gfMul(g[j], GF_EXP[i]);
            }
            g = ng;
        }
        return g;
    }

    // Compute RS error correction codewords
    function rsEncode(data, nsym) {
        const gen = rsGenPoly(nsym);
        const res = new Uint8Array(data.length + nsym);
        res.set(data);
        for (let i = 0; i < data.length; i++) {
            const coef = res[i];
            if (coef !== 0) {
                for (let j = 0; j < gen.length; j++) {
                    res[i + j] ^= gfMul(gen[j], coef);
                }
            }
        }
        return res.slice(data.length);
    }

    // Select smallest version that can hold data
    function selectVersion(dataLen) {
        // Byte mode: 4 bits mode + char count bits + data + terminator
        for (let v = 1; v <= 40; v++) {
            const ccBits = v <= 9 ? 8 : 16;
            const totalBits = 4 + ccBits + dataLen * 8;
            const capacity = DATA_CODEWORDS_M[v - 1] * 8;
            if (totalBits <= capacity) return v;
        }
        return -1; // Too much data
    }

    // Encode data into codewords
    function encodeData(data, version) {
        const ccBits = version <= 9 ? 8 : 16;
        const totalDataCodewords = DATA_CODEWORDS_M[version - 1];
        const bits = [];

        function pushBits(val, len) {
            for (let i = len - 1; i >= 0; i--) {
                bits.push((val >> i) & 1);
            }
        }

        // Mode indicator: byte = 0100
        pushBits(0b0100, 4);
        // Character count
        pushBits(data.length, ccBits);
        // Data bytes
        for (let i = 0; i < data.length; i++) {
            pushBits(data[i], 8);
        }
        // Terminator (up to 4 zeros)
        const totalBits = totalDataCodewords * 8;
        const termLen = Math.min(4, totalBits - bits.length);
        pushBits(0, termLen);

        // Pad to byte boundary
        while (bits.length % 8 !== 0) bits.push(0);

        // Pad codewords
        const padBytes = [0xEC, 0x11];
        let padIdx = 0;
        while (bits.length < totalBits) {
            pushBits(padBytes[padIdx], 8);
            padIdx ^= 1;
        }

        // Convert to bytes
        const codewords = new Uint8Array(totalDataCodewords);
        for (let i = 0; i < totalDataCodewords; i++) {
            let b = 0;
            for (let j = 0; j < 8; j++) {
                b = (b << 1) | bits[i * 8 + j];
            }
            codewords[i] = b;
        }

        return codewords;
    }

    // Interleave data and EC codewords
    function interleave(dataCodewords, version) {
        const bt = BLOCK_TABLE_M[version - 1];
        const ecPerBlock = EC_CODEWORDS_M[version - 1];
        const blocks = [];
        let offset = 0;

        // Group 1
        for (let i = 0; i < bt[0]; i++) {
            const dc = dataCodewords.slice(offset, offset + bt[1]);
            const ec = rsEncode(dc, ecPerBlock);
            blocks.push({ dc, ec });
            offset += bt[1];
        }
        // Group 2
        for (let i = 0; i < bt[2]; i++) {
            const dc = dataCodewords.slice(offset, offset + bt[3]);
            const ec = rsEncode(dc, ecPerBlock);
            blocks.push({ dc, ec });
            offset += bt[3];
        }

        // Interleave data
        const result = [];
        const maxDc = Math.max(bt[1], bt[3] || 0);
        for (let i = 0; i < maxDc; i++) {
            for (const block of blocks) {
                if (i < block.dc.length) result.push(block.dc[i]);
            }
        }
        // Interleave EC
        for (let i = 0; i < ecPerBlock; i++) {
            for (const block of blocks) {
                result.push(block.ec[i]);
            }
        }

        return result;
    }

    // Create the QR matrix
    function createMatrix(version) {
        const size = version * 4 + 17;
        const matrix = [];
        const reserved = [];
        for (let i = 0; i < size; i++) {
            matrix.push(new Uint8Array(size));
            reserved.push(new Uint8Array(size));
        }
        return { matrix, reserved, size };
    }

    // Place finder patterns
    function placeFinderPattern(m, row, col) {
        for (let r = -1; r <= 7; r++) {
            for (let c = -1; c <= 7; c++) {
                const rr = row + r, cc = col + c;
                if (rr < 0 || rr >= m.size || cc < 0 || cc >= m.size) continue;
                if (r >= 0 && r <= 6 && c >= 0 && c <= 6) {
                    if (r === 0 || r === 6 || c === 0 || c === 6 ||
                        (r >= 2 && r <= 4 && c >= 2 && c <= 4)) {
                        m.matrix[rr][cc] = 1;
                    } else {
                        m.matrix[rr][cc] = 0;
                    }
                } else {
                    m.matrix[rr][cc] = 0;
                }
                m.reserved[rr][cc] = 1;
            }
        }
    }

    // Place alignment patterns
    function placeAlignmentPatterns(m, version) {
        if (version < 2) return;
        const positions = ALIGNMENT_POSITIONS[version - 1];
        for (const row of positions) {
            for (const col of positions) {
                // Skip if overlapping finder patterns
                if (row <= 8 && col <= 8) continue;
                if (row <= 8 && col >= m.size - 8) continue;
                if (row >= m.size - 8 && col <= 8) continue;

                for (let r = -2; r <= 2; r++) {
                    for (let c = -2; c <= 2; c++) {
                        const rr = row + r, cc = col + c;
                        if (Math.abs(r) === 2 || Math.abs(c) === 2 ||
                            (r === 0 && c === 0)) {
                            m.matrix[rr][cc] = 1;
                        } else {
                            m.matrix[rr][cc] = 0;
                        }
                        m.reserved[rr][cc] = 1;
                    }
                }
            }
        }
    }

    // Place timing patterns
    function placeTimingPatterns(m) {
        for (let i = 8; i < m.size - 8; i++) {
            const val = (i % 2 === 0) ? 1 : 0;
            if (!m.reserved[6][i]) {
                m.matrix[6][i] = val;
                m.reserved[6][i] = 1;
            }
            if (!m.reserved[i][6]) {
                m.matrix[i][6] = val;
                m.reserved[i][6] = 1;
            }
        }
    }

    // Reserve format info area
    function reserveFormatArea(m) {
        // Around top-left finder
        for (let i = 0; i <= 8; i++) {
            if (!m.reserved[8][i]) m.reserved[8][i] = 1;
            if (!m.reserved[i][8]) m.reserved[i][8] = 1;
        }
        // Around top-right finder
        for (let i = 0; i <= 7; i++) {
            if (!m.reserved[8][m.size - 1 - i]) m.reserved[8][m.size - 1 - i] = 1;
        }
        // Around bottom-left finder
        for (let i = 0; i <= 7; i++) {
            if (!m.reserved[m.size - 1 - i][8]) m.reserved[m.size - 1 - i][8] = 1;
        }
        // Dark module
        m.matrix[m.size - 8][8] = 1;
        m.reserved[m.size - 8][8] = 1;
    }

    // Reserve version info area (versions >= 7)
    function reserveVersionArea(m, version) {
        if (version < 7) return;
        // Bottom-left
        for (let i = 0; i < 6; i++) {
            for (let j = 0; j < 3; j++) {
                m.reserved[m.size - 11 + j][i] = 1;
            }
        }
        // Top-right
        for (let i = 0; i < 6; i++) {
            for (let j = 0; j < 3; j++) {
                m.reserved[i][m.size - 11 + j] = 1;
            }
        }
    }

    // Place data bits
    function placeDataBits(m, dataBits) {
        let bitIdx = 0;
        let upward = true;
        for (let col = m.size - 1; col >= 1; col -= 2) {
            if (col === 6) col = 5; // Skip timing pattern column
            const rows = upward
                ? Array.from({ length: m.size }, (_, i) => m.size - 1 - i)
                : Array.from({ length: m.size }, (_, i) => i);

            for (const row of rows) {
                for (let c = 0; c < 2; c++) {
                    const cc = col - c;
                    if (m.reserved[row][cc]) continue;
                    if (bitIdx < dataBits.length) {
                        m.matrix[row][cc] = dataBits[bitIdx];
                    }
                    bitIdx++;
                }
            }
            upward = !upward;
        }
    }

    // Mask patterns
    const MASK_FNS = [
        (r, c) => (r + c) % 2 === 0,
        (r, c) => r % 2 === 0,
        (r, c) => c % 3 === 0,
        (r, c) => (r + c) % 3 === 0,
        (r, c) => (Math.floor(r / 2) + Math.floor(c / 3)) % 2 === 0,
        (r, c) => ((r * c) % 2 + (r * c) % 3) === 0,
        (r, c) => ((r * c) % 2 + (r * c) % 3) % 2 === 0,
        (r, c) => ((r + c) % 2 + (r * c) % 3) % 2 === 0,
    ];

    function applyMask(m, maskIdx) {
        const fn = MASK_FNS[maskIdx];
        for (let r = 0; r < m.size; r++) {
            for (let c = 0; c < m.size; c++) {
                if (!m.reserved[r][c] && fn(r, c)) {
                    m.matrix[r][c] ^= 1;
                }
            }
        }
    }

    // Place format info
    function placeFormatInfo(m, maskIdx) {
        const info = FORMAT_INFO_M[maskIdx];
        // Horizontal: left of finder + right
        const bits = [];
        for (let i = 14; i >= 0; i--) {
            bits.push((info >> i) & 1);
        }

        // Around top-left: row 8, cols 0-7 (skip col 6); col 8, rows 7-0 (skip row 6)
        const hPositions = [
            [8, 0], [8, 1], [8, 2], [8, 3], [8, 4], [8, 5],
            [8, 7], [8, 8], [7, 8], [5, 8], [4, 8], [3, 8],
            [2, 8], [1, 8], [0, 8]
        ];
        for (let i = 0; i < 15; i++) {
            m.matrix[hPositions[i][0]][hPositions[i][1]] = bits[i];
        }

        // Top-right: row 8, cols (size-8) to (size-1)
        for (let i = 0; i < 8; i++) {
            m.matrix[8][m.size - 8 + i] = bits[i];
        }
        // Bottom-left: col 8, rows (size-7) to (size-1)
        for (let i = 0; i < 7; i++) {
            m.matrix[m.size - 7 + i][8] = bits[8 + i];
        }
    }

    // Place version info
    function placeVersionInfo(m, version) {
        if (version < 7) return;
        const info = VERSION_INFO[version - 7];
        for (let i = 0; i < 18; i++) {
            const bit = (info >> i) & 1;
            const row = Math.floor(i / 3);
            const col = i % 3;
            // Bottom-left block
            m.matrix[m.size - 11 + col][row] = bit;
            // Top-right block
            m.matrix[row][m.size - 11 + col] = bit;
        }
    }

    // Calculate penalty score for mask selection
    function calcPenalty(m) {
        let penalty = 0;
        const s = m.size;

        // Rule 1: Runs of same color
        for (let r = 0; r < s; r++) {
            let count = 1;
            for (let c = 1; c < s; c++) {
                if (m.matrix[r][c] === m.matrix[r][c - 1]) {
                    count++;
                    if (count === 5) penalty += 3;
                    else if (count > 5) penalty += 1;
                } else {
                    count = 1;
                }
            }
        }
        for (let c = 0; c < s; c++) {
            let count = 1;
            for (let r = 1; r < s; r++) {
                if (m.matrix[r][c] === m.matrix[r - 1][c]) {
                    count++;
                    if (count === 5) penalty += 3;
                    else if (count > 5) penalty += 1;
                } else {
                    count = 1;
                }
            }
        }

        // Rule 2: 2x2 blocks
        for (let r = 0; r < s - 1; r++) {
            for (let c = 0; c < s - 1; c++) {
                const v = m.matrix[r][c];
                if (v === m.matrix[r][c + 1] &&
                    v === m.matrix[r + 1][c] &&
                    v === m.matrix[r + 1][c + 1]) {
                    penalty += 3;
                }
            }
        }

        // Rule 3: Finder-like patterns
        for (let r = 0; r < s; r++) {
            for (let c = 0; c < s - 10; c++) {
                if (m.matrix[r][c] === 1 && m.matrix[r][c + 1] === 0 &&
                    m.matrix[r][c + 2] === 1 && m.matrix[r][c + 3] === 1 &&
                    m.matrix[r][c + 4] === 1 && m.matrix[r][c + 5] === 0 &&
                    m.matrix[r][c + 6] === 1 && m.matrix[r][c + 7] === 0 &&
                    m.matrix[r][c + 8] === 0 && m.matrix[r][c + 9] === 0 &&
                    m.matrix[r][c + 10] === 0) {
                    penalty += 40;
                }
                if (m.matrix[r][c] === 0 && m.matrix[r][c + 1] === 0 &&
                    m.matrix[r][c + 2] === 0 && m.matrix[r][c + 3] === 0 &&
                    m.matrix[r][c + 4] === 1 && m.matrix[r][c + 5] === 0 &&
                    m.matrix[r][c + 6] === 1 && m.matrix[r][c + 7] === 1 &&
                    m.matrix[r][c + 8] === 1 && m.matrix[r][c + 9] === 0 &&
                    m.matrix[r][c + 10] === 1) {
                    penalty += 40;
                }
            }
        }
        for (let c = 0; c < s; c++) {
            for (let r = 0; r < s - 10; r++) {
                if (m.matrix[r][c] === 1 && m.matrix[r + 1][c] === 0 &&
                    m.matrix[r + 2][c] === 1 && m.matrix[r + 3][c] === 1 &&
                    m.matrix[r + 4][c] === 1 && m.matrix[r + 5][c] === 0 &&
                    m.matrix[r + 6][c] === 1 && m.matrix[r + 7][c] === 0 &&
                    m.matrix[r + 8][c] === 0 && m.matrix[r + 9][c] === 0 &&
                    m.matrix[r + 10][c] === 0) {
                    penalty += 40;
                }
                if (m.matrix[r][c] === 0 && m.matrix[r + 1][c] === 0 &&
                    m.matrix[r + 2][c] === 0 && m.matrix[r + 3][c] === 0 &&
                    m.matrix[r + 4][c] === 1 && m.matrix[r + 5][c] === 0 &&
                    m.matrix[r + 6][c] === 1 && m.matrix[r + 7][c] === 1 &&
                    m.matrix[r + 8][c] === 1 && m.matrix[r + 9][c] === 0 &&
                    m.matrix[r + 10][c] === 1) {
                    penalty += 40;
                }
            }
        }

        // Rule 4: Dark/light ratio
        let dark = 0;
        for (let r = 0; r < s; r++) {
            for (let c = 0; c < s; c++) {
                if (m.matrix[r][c]) dark++;
            }
        }
        const pct = (dark * 100) / (s * s);
        const prev5 = Math.abs(Math.floor(pct / 5) * 5 - 50) / 5;
        const next5 = Math.abs(Math.ceil(pct / 5) * 5 - 50) / 5;
        penalty += Math.min(prev5, next5) * 10;

        return penalty;
    }

    // Deep copy matrix
    function cloneMatrix(m) {
        return {
            matrix: m.matrix.map(r => new Uint8Array(r)),
            reserved: m.reserved.map(r => new Uint8Array(r)),
            size: m.size
        };
    }

    // Main encode function: returns { matrix: 2D array, size, version }
    function encode(text) {
        // Convert text to UTF-8 bytes
        const encoder = new TextEncoder();
        const data = encoder.encode(text);

        const version = selectVersion(data.length);
        if (version < 0) throw new Error('Daten zu lang fuer QR-Code');

        // Encode data + EC
        const dataCodewords = encodeData(data, version);
        const finalBits = interleave(dataCodewords, version);

        // Convert to bit array
        const dataBits = [];
        for (const byte of finalBits) {
            for (let i = 7; i >= 0; i--) {
                dataBits.push((byte >> i) & 1);
            }
        }

        // Add remainder bits
        const remainderBits = [0, 7, 7, 7, 7, 7, 0, 0, 0, 0, 0, 0, 0, 3, 3, 3, 3, 3, 3, 3,
            4, 4, 4, 4, 4, 4, 4, 3, 3, 3, 3, 3, 3, 3, 0, 0, 0, 0, 0, 0][version - 1];
        for (let i = 0; i < remainderBits; i++) {
            dataBits.push(0);
        }

        // Build matrix
        const base = createMatrix(version);

        // Place function patterns
        placeFinderPattern(base, 0, 0);
        placeFinderPattern(base, 0, base.size - 7);
        placeFinderPattern(base, base.size - 7, 0);
        placeAlignmentPatterns(base, version);
        placeTimingPatterns(base);
        reserveFormatArea(base);
        reserveVersionArea(base, version);

        // Place data
        placeDataBits(base, dataBits);

        // Try all 8 masks and pick best
        let bestMask = 0;
        let bestPenalty = Infinity;

        for (let maskIdx = 0; maskIdx < 8; maskIdx++) {
            const candidate = cloneMatrix(base);
            applyMask(candidate, maskIdx);
            placeFormatInfo(candidate, maskIdx);
            placeVersionInfo(candidate, version);

            const penalty = calcPenalty(candidate);
            if (penalty < bestPenalty) {
                bestPenalty = penalty;
                bestMask = maskIdx;
            }
        }

        // Apply best mask to base
        applyMask(base, bestMask);
        placeFormatInfo(base, bestMask);
        placeVersionInfo(base, version);

        return {
            matrix: base.matrix,
            size: base.size,
            version: version,
            dataLength: data.length
        };
    }

    return { encode };
})();


// ─── Tool UI ───

function init_qr_generator(container) {

    let currentMode = 'url';
    let currentSize = 300;
    let debounceTimer = null;
    let lastQrData = null;

    // --- HTML Template ---
    container.innerHTML = `
        <section class="card qr-input-card">
            <div class="qr-mode-chips" id="qr-mode-chips">
                <span class="chip qr-mode-chip active" data-mode="url">URL</span>
                <span class="chip qr-mode-chip" data-mode="text">Text</span>
                <span class="chip qr-mode-chip" data-mode="wifi">WLAN</span>
                <span class="chip qr-mode-chip" data-mode="email">E-Mail</span>
            </div>

            <div id="qr-form"></div>

            <div class="quick-examples qr-examples" id="qr-examples"></div>
        </section>

        <section class="card qr-output-card" id="qr-output-card" style="display:none;">
            <div class="qr-canvas-wrap">
                <canvas id="qr-canvas"></canvas>
            </div>

            <div class="qr-size-chips" id="qr-size-chips">
                <span class="chip qr-size-chip" data-size="200">Klein</span>
                <span class="chip qr-size-chip active" data-size="300">Mittel</span>
                <span class="chip qr-size-chip" data-size="500">Gro\u00DF</span>
            </div>

            <div class="qr-actions">
                <button class="qr-action-btn primary" id="qr-download-btn">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                    Als PNG
                </button>
                <button class="qr-action-btn" id="qr-copy-btn">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                    Kopieren
                </button>
            </div>

            <p class="qr-info" id="qr-info"></p>
            <p class="qr-error" id="qr-error" style="display:none;"></p>
        </section>
    `;

    // --- DOM References ---
    const formEl = document.getElementById('qr-form');
    const examplesEl = document.getElementById('qr-examples');
    const outputCard = document.getElementById('qr-output-card');
    const canvas = document.getElementById('qr-canvas');
    const ctx = canvas.getContext('2d');
    const infoEl = document.getElementById('qr-info');
    const errorEl = document.getElementById('qr-error');
    const downloadBtn = document.getElementById('qr-download-btn');
    const copyBtn = document.getElementById('qr-copy-btn');
    const modeChips = container.querySelectorAll('.qr-mode-chip');
    const sizeChips = container.querySelectorAll('.qr-size-chip');

    // --- Mode Switching ---
    modeChips.forEach(chip => {
        chip.addEventListener('click', () => {
            modeChips.forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            currentMode = chip.dataset.mode;
            renderForm();
            outputCard.style.display = 'none';
        });
    });

    // --- Size Chips ---
    sizeChips.forEach(chip => {
        chip.addEventListener('click', () => {
            sizeChips.forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            currentSize = parseInt(chip.dataset.size);
            if (lastQrData) renderQR(lastQrData);
        });
    });

    // --- Render Form ---
    function renderForm() {
        let html = '';
        let examples = '';

        switch (currentMode) {
            case 'url':
                html = `
                    <label>URL</label>
                    <input type="url" class="qr-input" id="qr-url-input" placeholder="https://example.com" autocomplete="off" spellcheck="false">
                `;
                examples = `
                    <span class="chip" data-val="https://google.com">Google</span>
                    <span class="chip" data-val="https://github.com">GitHub</span>
                    <span class="chip" data-val="https://wikipedia.org">Wikipedia</span>
                `;
                break;

            case 'text':
                html = `
                    <label>Text</label>
                    <textarea class="qr-textarea" id="qr-text-input" placeholder="Beliebigen Text eingeben..." rows="4"></textarea>
                `;
                examples = `
                    <span class="chip" data-val="Hallo Welt!">Hallo Welt!</span>
                    <span class="chip" data-val="Tel: +49 123 456789">Telefonnummer</span>
                `;
                break;

            case 'wifi':
                html = `
                    <label>SSID (Netzwerkname)</label>
                    <input type="text" class="qr-input" id="qr-wifi-ssid" placeholder="MeinWLAN" autocomplete="off" spellcheck="false">

                    <label>Verschl\u00FCsselung</label>
                    <div class="qr-enc-chips" id="qr-enc-chips">
                        <span class="chip qr-enc-chip active" data-enc="WPA">WPA/WPA2</span>
                        <span class="chip qr-enc-chip" data-enc="SAE">WPA3</span>
                        <span class="chip qr-enc-chip" data-enc="WEP">WEP</span>
                        <span class="chip qr-enc-chip" data-enc="nopass">Keine</span>
                    </div>

                    <label>Passwort</label>
                    <div class="qr-password-row">
                        <input type="password" class="qr-input" id="qr-wifi-pass" placeholder="WLAN-Passwort" autocomplete="off">
                        <button class="qr-toggle-vis" id="qr-toggle-vis" type="button" title="Passwort anzeigen">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                        </button>
                    </div>

                    <label class="qr-hidden-row" id="qr-hidden-row">
                        <input type="checkbox" id="qr-wifi-hidden">
                        <span class="qr-hidden-label">Verstecktes Netzwerk</span>
                    </label>
                `;
                examples = '';
                break;

            case 'email':
                html = `
                    <label>E-Mail-Adresse</label>
                    <input type="email" class="qr-input" id="qr-email-addr" placeholder="name@example.com" autocomplete="off" spellcheck="false">

                    <label>Betreff</label>
                    <input type="text" class="qr-input" id="qr-email-subject" placeholder="Betreff der E-Mail" autocomplete="off">

                    <label>Nachricht</label>
                    <textarea class="qr-textarea" id="qr-email-body" placeholder="Nachricht eingeben..." rows="3"></textarea>
                `;
                examples = `
                    <span class="chip" data-email="info@example.com" data-subject="Anfrage" data-body="Hallo, ich habe eine Frage.">Beispiel-Anfrage</span>
                `;
                break;
        }

        formEl.innerHTML = html;
        examplesEl.innerHTML = examples;

        // Bind input events
        bindFormEvents();
    }

    // --- Bind Form Events ---
    function bindFormEvents() {
        const inputs = formEl.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            input.addEventListener('input', debouncedGenerate);
        });

        // WLAN encryption chips
        if (currentMode === 'wifi') {
            const encChips = formEl.querySelectorAll('.qr-enc-chip');
            encChips.forEach(chip => {
                chip.addEventListener('click', () => {
                    encChips.forEach(c => c.classList.remove('active'));
                    chip.classList.add('active');
                    // Hide/show password field based on encryption
                    const passLabel = formEl.querySelector('label[for="qr-wifi-pass"]');
                    const passRow = formEl.querySelector('.qr-password-row');
                    const passInput = document.getElementById('qr-wifi-pass');
                    if (chip.dataset.enc === 'nopass') {
                        if (passRow) passRow.style.opacity = '0.3';
                        if (passInput) { passInput.disabled = true; passInput.value = ''; }
                    } else {
                        if (passRow) passRow.style.opacity = '1';
                        if (passInput) passInput.disabled = false;
                    }
                    debouncedGenerate();
                });
            });

            // Toggle password visibility
            const toggleBtn = document.getElementById('qr-toggle-vis');
            if (toggleBtn) {
                toggleBtn.addEventListener('click', () => {
                    const passInput = document.getElementById('qr-wifi-pass');
                    if (passInput) {
                        const isHidden = passInput.type === 'password';
                        passInput.type = isHidden ? 'text' : 'password';
                        toggleBtn.innerHTML = isHidden
                            ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>'
                            : '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>';
                    }
                });
            }

            // Hidden network checkbox
            const hiddenCb = document.getElementById('qr-wifi-hidden');
            if (hiddenCb) {
                hiddenCb.addEventListener('change', debouncedGenerate);
            }
        }

        // Quick examples
        examplesEl.querySelectorAll('.chip').forEach(chip => {
            chip.addEventListener('click', () => {
                if (currentMode === 'url') {
                    document.getElementById('qr-url-input').value = chip.dataset.val;
                } else if (currentMode === 'text') {
                    document.getElementById('qr-text-input').value = chip.dataset.val;
                } else if (currentMode === 'email') {
                    const addr = document.getElementById('qr-email-addr');
                    const subj = document.getElementById('qr-email-subject');
                    const body = document.getElementById('qr-email-body');
                    if (chip.dataset.email) addr.value = chip.dataset.email;
                    if (chip.dataset.subject) subj.value = chip.dataset.subject;
                    if (chip.dataset.body) body.value = chip.dataset.body;
                }
                generateQR();
            });
        });
    }

    // --- Debounce ---
    function debouncedGenerate() {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(generateQR, 300);
    }

    // --- Escape WLAN special characters ---
    function escapeWifi(str) {
        return str.replace(/([\\;,":.])/g, '\\$1');
    }

    // --- Build QR data string ---
    function buildDataString() {
        switch (currentMode) {
            case 'url': {
                let url = (document.getElementById('qr-url-input')?.value || '').trim();
                if (!url) return '';
                // Auto-prepend https:// if no protocol
                if (!/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(url)) {
                    url = 'https://' + url;
                }
                return url;
            }
            case 'text': {
                return (document.getElementById('qr-text-input')?.value || '').trim();
            }
            case 'wifi': {
                const ssid = (document.getElementById('qr-wifi-ssid')?.value || '').trim();
                if (!ssid) return '';
                const encChip = formEl.querySelector('.qr-enc-chip.active');
                const enc = encChip ? encChip.dataset.enc : 'WPA';
                const pass = (document.getElementById('qr-wifi-pass')?.value || '');
                const hidden = document.getElementById('qr-wifi-hidden')?.checked || false;

                let wifiStr = 'WIFI:';
                wifiStr += 'T:' + (enc === 'nopass' ? 'nopass' : enc) + ';';
                wifiStr += 'S:' + escapeWifi(ssid) + ';';
                if (enc !== 'nopass' && pass) {
                    wifiStr += 'P:' + escapeWifi(pass) + ';';
                }
                if (hidden) {
                    wifiStr += 'H:true;';
                }
                wifiStr += ';';
                return wifiStr;
            }
            case 'email': {
                const addr = (document.getElementById('qr-email-addr')?.value || '').trim();
                if (!addr) return '';
                const subject = (document.getElementById('qr-email-subject')?.value || '').trim();
                const body = (document.getElementById('qr-email-body')?.value || '').trim();
                let mailto = 'mailto:' + addr;
                const params = [];
                if (subject) params.push('subject=' + encodeURIComponent(subject));
                if (body) params.push('body=' + encodeURIComponent(body));
                if (params.length) mailto += '?' + params.join('&');
                return mailto;
            }
            default:
                return '';
        }
    }

    // --- Generate QR Code ---
    function generateQR() {
        const data = buildDataString();
        errorEl.style.display = 'none';

        if (!data) {
            outputCard.style.display = 'none';
            lastQrData = null;
            return;
        }

        try {
            const qr = QRCode.encode(data);
            lastQrData = qr;
            renderQR(qr);

            // Info text
            infoEl.textContent = `Version ${qr.version} \u2022 ${qr.size}\u00D7${qr.size} Module \u2022 ${qr.dataLength} Bytes`;

            outputCard.style.display = 'block';
            outputCard.style.animation = 'none';
            outputCard.offsetHeight;
            outputCard.style.animation = 'slideUp 0.3s ease-out';
        } catch (err) {
            errorEl.textContent = err.message || 'Fehler beim Erstellen des QR-Codes.';
            errorEl.style.display = 'block';
            outputCard.style.display = 'none';
            lastQrData = null;
        }
    }

    // --- Render QR Code on Canvas ---
    function renderQR(qr) {
        const quietZone = 4;
        const totalModules = qr.size + quietZone * 2;
        const moduleSize = Math.max(1, Math.floor(currentSize / totalModules));
        const canvasSize = moduleSize * totalModules;

        canvas.width = canvasSize;
        canvas.height = canvasSize;

        // White background
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvasSize, canvasSize);

        // Dark modules
        ctx.fillStyle = '#000000';
        for (let r = 0; r < qr.size; r++) {
            for (let c = 0; c < qr.size; c++) {
                if (qr.matrix[r][c]) {
                    ctx.fillRect(
                        (c + quietZone) * moduleSize,
                        (r + quietZone) * moduleSize,
                        moduleSize,
                        moduleSize
                    );
                }
            }
        }
    }

    // --- Download PNG ---
    downloadBtn.addEventListener('click', () => {
        if (!lastQrData) return;
        const link = document.createElement('a');
        link.download = 'qr-code.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
    });

    // --- Copy to Clipboard ---
    copyBtn.addEventListener('click', () => {
        if (!lastQrData) return;
        canvas.toBlob(blob => {
            if (!blob) return;
            navigator.clipboard.write([
                new ClipboardItem({ 'image/png': blob })
            ]).then(() => {
                const origHTML = copyBtn.innerHTML;
                copyBtn.innerHTML = `
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                    Kopiert!
                `;
                copyBtn.classList.add('copied');
                setTimeout(() => {
                    copyBtn.innerHTML = origHTML;
                    copyBtn.classList.remove('copied');
                }, 1500);
            }).catch(() => {
                // Fallback: copy data URL as text
                navigator.clipboard.writeText(canvas.toDataURL('image/png')).then(() => {
                    const origHTML = copyBtn.innerHTML;
                    copyBtn.innerHTML = `
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                        Kopiert!
                    `;
                    copyBtn.classList.add('copied');
                    setTimeout(() => {
                        copyBtn.innerHTML = origHTML;
                        copyBtn.classList.remove('copied');
                    }, 1500);
                });
            });
        }, 'image/png');
    });

    // --- Init ---
    renderForm();
}

function teardown_qr_generator() {
    // No cleanup needed — DOM is replaced on navigation
}
