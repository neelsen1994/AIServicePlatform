FROM nvidia/cuda:11.8.0-cudnn8-devel-ubuntu22.04

ARG DEBIAN_FRONTEND=noninteractive

# Keeps Python from generating .pyc files in the container
ENV PYTHONDONTWRITEBYTECODE 1

# Turns off buffering for easier container logging
ENV PYTHONUNBUFFERED 1

# Update and install debian stuff
RUN apt-get update && apt-get -y install \
    wget \
    unzip \
    git \
    curl \
    aptitude \
    vim \
    tree \
    software-properties-common \
    lsb-release \
    manpages-dev \
    build-essential \
    libgl1-mesa-glx \
    mesa-utils\
    libboost-dev \
    libxerces-c-dev \
    libeigen3-dev\
    python-is-python3 \
    python3-pip \
    python3-tk \
    && apt-get autoremove -y \
    && apt-get clean -y \
    && rm -rf /var/lib/apt/lists/*

EXPOSE 8888

# Install miniconda
ENV CONDA_DIR /opt/conda
RUN wget --quiet https://repo.anaconda.com/miniconda/Miniconda3-latest-Linux-x86_64.sh -O ~/miniconda.sh && \
     /bin/bash ~/miniconda.sh -b -p /opt/conda && rm ~/miniconda.sh && \
     echo ". /opt/conda/etc/profile.d/conda.sh" >> ~/.bashrc && \
     echo "conda activate base" >> ~/.bashrc

# Put conda in path so we can use conda activate
ENV PATH $CONDA_DIR/bin:$PATH

# install GDAL/OGR
RUN add-apt-repository ppa:ubuntugis/ppa

RUN aptitude -y install \
    gdal-bin \
    libgdal-dev

# Set a specific user, UID, and GID
ARG USERNAME=debsen
ARG USER_UID=1000
ARG USER_GID=$USER_UID

# Install sudo and create the user
RUN apt-get update && apt-get -y install sudo && \
    groupadd --gid $USER_GID $USERNAME && \
    useradd --uid $USER_UID --gid $USER_GID -m $USERNAME && \
    echo "$USERNAME ALL=(ALL) NOPASSWD:ALL" > /etc/sudoers.d/$USERNAME && \
    chmod 0440 /etc/sudoers.d/$USERNAME

# Switch to the new user
USER $USERNAME

COPY requirements.txt requirements.txt

RUN python -m pip install -r requirements.txt

