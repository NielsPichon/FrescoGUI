echo Installing pre-requisites

git submodule init
git submodule update

pip install -r requirements.txt
pip install -r ./AxiFresco/requirements.txt

echo Done.