echo Installing pre-requisites

git submodule init
git submodule update

pip install -r requirements.txt

echo Done.