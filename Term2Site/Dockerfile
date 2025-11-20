# ===============================
# Term2Site Base Image (Ubuntu 22.04)
# ===============================

FROM ubuntu:22.04

RUN apt-get update && \
    DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends \
    bash \
    coreutils \
    ca-certificates \
    curl \
    procps && \
    rm -rf /var/lib/apt/lists/*

ARG UNAME=webuser
ARG UID=0
RUN useradd -m -u ${UID} -s /bin/bash ${UNAME}

USER ${UNAME}
WORKDIR /home/${UNAME}

CMD ["/bin/bash"]

