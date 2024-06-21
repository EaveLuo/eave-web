---
sidebar_position: 1
slug: ssh-key-login-host
title: Log in to the host via SSH key
tags: [linux, ssh]
keywords:
  - linux
  - ssh
---

Log in to the remote server via SSH key (solves some strange problems when logging in with account password, and also improves security)

### Preface

In daily work, we often need to log in to the remote server to perform various operations, such as viewing logs, uploading files, executing commands, etc. However, if you need to enter a password every time, it would be very troublesome, and the password is easy to be leaked, stolen, cracked, and security is affected.

SSH key login can solve this problem. It allows you to upload the public key to the remote host only once, and then use the SSH key for authentication directly without entering a password.

### Preparation

First, you need to generate a key pair on your local computer and upload the public key to the remote host's `~/.ssh/authorized_keys` file.

```bash
# Generate a key pair on the local computer
# ssh-keygen [-t type (encryption algorithm, default rsa)] [-b bits] [-C comment] [file name]
$ ssh-keygen

# View the public key content
$ cat ~/.ssh/id_rsa.pub

# Manually upload the public key to the remote host's ~/.ssh/authorized_keys file or use the ssh-copy-id command
$ ssh-copy-id user@remote_host
```

### Log in to the remote host

```bash
# Log in to the remote host
$ ssh user@remote_host

# No need to enter a password, use SSH key for authentication
```

### Notes

- Key login is not safe. Do not upload your private key to a public Git repository or other publicly accessible places.
- Key login is not suitable for all scenarios, such as requiring a complex password or using the sudo command.