# GraphChat

This is a LLM chat frontend that visualizes and manages a dialog graph, allowing users to create, edit, and interact with nodes representing conversation flows. The application features a ReactFlow-based interface where users can add input nodes and response nodes to build dialogue trees.

## Features

- Interactive dialog graph visualization using ReactFlow
- Dynamic node creation and editing (input and response nodes)
- Context-aware chat state management
- Integration with Ollama for AI-powered responses
- Responsive UI with sidebar and modal components

## Getting Started

### NIX

#### WSL / WSL 2

This project uses [Nix](https://nixos.org/) flakes to provide a reproducible development environment.
Follow the steps below to get started on **WSL or WSL2**.

---

## 1. Install Nix Package Manager on WSL/WSL2

1. Update your system packages:

   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

2. Install **curl** and **xz-utils** (required for installation):

   ```bash
   sudo apt install -y curl xz-utils
   ```

3. Run the official Nix installer with WSL support:

   ```bash
   sh <(curl -L https://nixos.org/nix/install) --daemon
   ```

4. Once installation finishes, **restart your shell**:

   ```bash
   exit
   ```

   Then open a new WSL terminal.

5. Verify Nix is working:

   ```bash
   nix --version
   ```

   You should see a version number.

---

## 2. Enable Flakes (once per user)

Nix flakes are still experimental and must be enabled:

```bash
mkdir -p ~/.config/nix
echo "experimental-features = nix-command flakes" >> ~/.config/nix/nix.conf
```

Then restart your shell again.

---

## 3. Enter the Dev Shell

At the root of the repository (where `flake.nix` is located), run:

```bash
nix develop
```

This will build and enter the development environment defined in the project’s `flake.nix`.
You can now run project commands with all dependencies available.

---

✅ That’s it — you’re inside the reproducible dev environment!

---

#### MacOS

This project uses [Nix](https://nixos.org) flakes to define reproducible development environments.

##### 1. Install Nix (macOS)

Run the official Nix installer script:

```bash
sh <(curl -L https://nixos.org/nix/install) --daemon
```

Then restart your shell (or log out/in) so the `nix` command is available.
Verify installation:

```bash
nix --version
```

##### 2. Enable Flakes

Nix flakes are still experimental, so you may need to enable them.
Add the following line to your Nix config file (`~/.config/nix/nix.conf`):

```
experimental-features = nix-command flakes
```

##### 3. Enter the Development Shell

Clone this repository if you haven’t already:

```bash
git clone <your-repo-url>
cd <your-repo-name>
```

Then drop into the dev shell defined by the project’s `flake.nix`:

```bash
nix develop
```

This will build and enter the environment with all dependencies specified in the flake.
From here you can run the project’s build, test, or runtime commands.

#### Linux

##### 1. Install Nix

Nix is a powerful package manager that works across Linux distributions. Follow the instructions below for your distro.

#### **For Most Linux Distributions (Ubuntu, Debian, Fedora, Arch, etc.)**

Open a terminal and run:

```bash
sh <(curl -L https://nixos.org/nix/install) --daemon
```

> This installs Nix in multi-user mode, which is recommended for most systems.

After installation, restart your terminal or source the Nix profile:

```bash
. /etc/profile.d/nix.sh
```

###### **Verify Installation**

```bash
nix --version
```

You should see something like:

```
nix (Nix) 3.x
```

---

##### 2. Enter a Nix Dev Shell Using Your `flake.nix`

Once Nix is installed, you can enter a development environment defined by the `flake.nix` in your project.

1. Navigate to the root of your project:

```bash
cd /path/to/your/project
```

2. Enter the Nix shell:

```bash
nix develop
```

> If you want to explicitly target the flake in the current directory:

```bash
nix develop .#default
```

3. You are now in a development shell with all dependencies and environment variables specified in your `flake.nix`.

4. To exit the dev shell:

```bash
exit
```

---

##### 3. Notes

- Make sure your Git repository is checked out and the `flake.nix` file is at the root.
- You can customize which environment to enter if your flake defines multiple dev shells:

```bash
nix develop .#my-dev-shell
```

- For more information about Nix flakes: [Nix Flakes Documentation](https://nixos.wiki/wiki/Flakes)

#### Running the server

Run these commands to build and start GraphChat:

```bash
yarn install
yarn build
yarn start
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## Learn More

To learn more about the project's architecture and features:

- [ReactFlow Documentation](https://reactflow.dev) - learn about the visualization library used.
- [Ollama Integration](/lib/ollama.ts) - understand how AI responses are generated.

You can check out the [GitHub repository](https://github.com/danhab99/dialog-graph) - your feedback and contributions are welcome!
