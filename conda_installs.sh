#
# Installs conda environment for building dSpaceX
#
echo ""
echo "Note: this script only supports bash and zsh shells"
echo ""

(return 0 2>/dev/null) && sourced=1 || sourced=0

if [[ "$sourced" == "0" ]]; then
  echo "ERROR: must call this script using \"source ./conda_installs.sh\""
  exit 1
fi

function install_conda() {
  if ! command -v conda 2>/dev/null 1>&2; then
    echo "installing anaconda..."
    if [ "$(uname)" == "Darwin" ]; then
      wget https://repo.anaconda.com/miniconda/Miniconda3-latest-MacOSX-x86_64.sh
      bash ./Miniconda3-latest-MacOSX-x86_64.sh
      rm ./Miniconda3-latest-MacOSX-x86_64.sh
    elif [ "$(uname)" == "Linux" ]; then
      wget https://repo.anaconda.com/miniconda/Miniconda3-latest-Linux-x86_64.sh
      bash ./Miniconda3-latest-Linux-x86_64.sh
      rm ./Miniconda3-latest-Linux-x86_64.sh
    else
      echo "ERROR: unknown OS $(uname)"
      return 1
    fi

    source ~/miniconda3/bin/activate
    conda config --set auto_activate_base false
  fi

  # add default channels
  conda config --add channels anaconda
  conda config --add channels conda-forge
  
  # update anaconda
  conda activate base
  if ! conda update --yes -n base conda; then return 1; fi
  if ! conda update --yes --all; then return 1; fi

  # create and activate dspacex env
  CONDAENV=dspacex
  if ! conda create --yes --name $CONDAENV python=3.7; then return 1; fi
  eval "$(conda shell.bash hook)"
  if ! conda activate $CONDAENV; then return 1; fi

  # pip is needed in sub-environments or the base env's pip will silently install to base
  if ! conda install --yes pip=20.1.1; then return 1; fi
  if ! python -m pip install --upgrade pip; then return 1; fi

  # install dspacex deps
  if ! conda install --yes \
       zlib=1.2.11 \
       ncurses=6.1 \
       cmake=3.15.5 \
       nodejs=13.9.0 \
       eigen=3.3.7 \
       gtest=1.10.0 \
       yaml-cpp=0.6.3 \
       numpy=1.18.1 \
       scikit-learn=0.22.1 \
       pandas=1.0.3 \
       pillow=7.0.0 \
       pyyaml=5.3.1 \
       matplotlib==3.2.1 \
       pybind11==2.5.0 \
       jupyter==1.0.0 \
       vtk==9.0.1 \
       ctags==5.8 \
       libzip==1.7.3 \
       scikit-image==0.17.2
  then return 1; fi

  # linux-only deps
  if [[ "$(uname)" = "Linux" ]]; then
    conda install --yes \
          blas=2.14 \
          liblapack=3.8.0
  fi
  
  # pip installs
  if ! pip install pynrrd==0.4.2; then return 1; fi
  if ! pip install pyrender==0.1.39; then return 1; fi
  if ! pip install grip==4.5.2; then return 1; fi
  # if ! pip install itkwidgets==0.32.0; then return 1; fi
  if ! pip install pyvista==0.26.1; then return 1; fi

  conda info
  return 0
}

if install_conda; then
  echo "$CONDAENV environment successfully created/updated!"
  conda activate $CONDAENV
else
  echo "Problem encountered creating/updating $CONDAENV conda environment."
  return 1;
fi
