#!/usr/bin/env bash
set -e

GIT_BIN="/Library/Developer/CommandLineTools/usr/bin/git"
GITHUB_USER="rjnarwal"

echo "========================================================="
echo " 🚀 Initializing & Staging All 5 Repositories for @$GITHUB_USER"
echo "========================================================="

# 1. Root Repository: Endly
echo -e "\n[1/5] Staging Endly API Client..."
$GIT_BIN init
$GIT_BIN branch -M main || true
$GIT_BIN add .
$GIT_BIN commit -m "feat: initial open-source release of Endly API Client" || true
$GIT_BIN remote remove origin 2>/dev/null || true
$GIT_BIN remote add origin "https://github.com/$GITHUB_USER/endly.git"
echo "✓ Endly ready: https://github.com/$GITHUB_USER/endly.git"

# 2. TokenLens
echo -e "\n[2/5] Staging TokenLens JWT Studio..."
cd tokenlens
$GIT_BIN init
$GIT_BIN branch -M main || true
$GIT_BIN add .
$GIT_BIN commit -m "feat: initial release of TokenLens JWT Studio" || true
$GIT_BIN remote remove origin 2>/dev/null || true
$GIT_BIN remote add origin "https://github.com/$GITHUB_USER/tokenlens.git"
cd ..
echo "✓ TokenLens ready: https://github.com/$GITHUB_USER/tokenlens.git"

# 3. JSONLens
echo -e "\n[3/5] Staging JSONLens..."
cd jsonlens
$GIT_BIN init
$GIT_BIN branch -M main || true
$GIT_BIN add .
$GIT_BIN commit -m "feat: initial release of JSONLens Diff & Formatter" || true
$GIT_BIN remote remove origin 2>/dev/null || true
$GIT_BIN remote add origin "https://github.com/$GITHUB_USER/jsonlens.git"
cd ..
echo "✓ JSONLens ready: https://github.com/$GITHUB_USER/jsonlens.git"

# 4. RegexForge
echo -e "\n[4/5] Staging RegexForge..."
cd regexforge
$GIT_BIN init
$GIT_BIN branch -M main || true
$GIT_BIN add .
$GIT_BIN commit -m "feat: initial release of RegexForge Studio" || true
$GIT_BIN remote remove origin 2>/dev/null || true
$GIT_BIN remote add origin "https://github.com/$GITHUB_USER/regexforge.git"
cd ..
echo "✓ RegexForge ready: https://github.com/$GITHUB_USER/regexforge.git"

# 5. CipherLab
echo -e "\n[5/5] Staging CipherLab..."
cd cipherlab
$GIT_BIN init
$GIT_BIN branch -M main || true
$GIT_BIN add .
$GIT_BIN commit -m "feat: initial release of CipherLab Crypto Studio" || true
$GIT_BIN remote remove origin 2>/dev/null || true
$GIT_BIN remote add origin "https://github.com/$GITHUB_USER/cipherlab.git"
cd ..
echo "✓ CipherLab ready: https://github.com/$GITHUB_USER/cipherlab.git"

echo -e "\n========================================================="
echo " 🎉 All 5 repositories initialized and committed locally!"
echo "========================================================="
