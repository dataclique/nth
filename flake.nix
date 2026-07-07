{
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-26.05";
    flake-utils.url = "github:numtide/flake-utils";

    git-hooks.url = "github:cachix/git-hooks.nix";
    git-hooks.inputs.nixpkgs.follows = "nixpkgs";

    # Deliberately NOT following our nixpkgs: the devenv CLI is only cached
    # on devenv.cachix.org against its own pinned nixpkgs; overriding it
    # forces a from-source rebuild of the whole devenv toolchain.
    # Pinned to a release tag: devenv master periodically has broken builds.
    devenv.url = "github:cachix/devenv/v2.1.2";
    devenv.inputs.git-hooks.follows = "git-hooks";

    but.url = "github:dataclique/but.nix";
    but.inputs.nixpkgs.follows = "nixpkgs";
  };

  outputs =
    {
      self,
      nixpkgs,
      flake-utils,
      git-hooks,
      devenv,
      but,
      ...
    }@inputs:
    # Only systems sui ships prebuilt binaries for.
    flake-utils.lib.eachSystem
      [
        "aarch64-darwin"
        "aarch64-linux"
        "x86_64-linux"
      ]
      (
        system:
        let
          pkgs = import nixpkgs { inherit system; };

          suiPkg =
            let
              baseUrl = "https://github.com/MystenLabs/sui/releases/download";
              version = "v1.75.1";
              assets = {
                aarch64-darwin = {
                  suffix = "macos-arm64";
                  hash = "sha256-JYjH6OtoUIwfuJ0FywLgtuYE+5xPi+XdjK3Sq9vUUdM=";
                };
                aarch64-linux = {
                  suffix = "ubuntu-aarch64";
                  hash = "sha256-hHOxr0sv6HpswHXnS8oUDn2VfoH8a3UCozmpPtCzRPQ=";
                };
                x86_64-linux = {
                  suffix = "ubuntu-x86_64";
                  hash = "sha256-rGWgxuXZxV6jkPwgPAqPPJIzqkJBMz32bwLhDmVtf1Q=";
                };
              };
              asset = assets.${system} or (throw "sui ${version} has no prebuilt binary for ${system}");
            in
            pkgs.stdenv.mkDerivation {
              name = "sui";
              src = pkgs.fetchzip {
                url = "${baseUrl}/testnet-${version}/sui-testnet-${version}-${asset.suffix}.tgz";
                inherit (asset) hash;
                stripRoot = false;
              };
              installPhase = ''
                mkdir -p $out/bin
                cp -v sui $out/bin
              '';
            };

          env = { };
          src = ./.;
          hooks = {
            nil.enable = true;
            nixfmt.enable = true;
            eslint.enable = true;
            prettier.enable = true;
            taplo.enable = true;
          };

        in
        {
          devShells.default = devenv.lib.mkShell {
            inherit inputs pkgs;
            modules = [
              (but.lib.${system}.devenvModule {
                repoNotes = ''
                  ## This Repository

                  - **Pre-commit hooks:** `but commit` runs nil, nixfmt, eslint, prettier, and taplo via git-hooks.
                  - **Commit messages:** short, lowercase, imperative — e.g. "deposits, withdrawals, and tests".
                  - **Branch names:** `<type>/<kebab-description>` — e.g. `feat/margin-account`.

                '';
              })
              {
                # https://devenv.sh/reference/options/
                packages = [ suiPkg ];

                languages = {
                  nix.enable = true;
                  javascript.enable = true;
                  javascript.pnpm.enable = true;
                  typescript.enable = true;
                  rust.enable = true;
                };

                inherit env;
                git-hooks = { inherit hooks; };
                difftastic.enable = true;
                cachix.enable = true;
              }
            ];
          };

          checks.git-hooks = git-hooks.lib.${system}.run { inherit hooks src; };
          packages.devenv-up = self.devShells.${system}.default.config.procfileScript;
        }
      );

  nixConfig = {
    extra-substituters = "https://devenv.cachix.org";
    extra-trusted-public-keys = "devenv.cachix.org-1:w1cLUi8dv3hnoSPGAuibQv+f9TZLr6cv/Hm9XgU50cw=";
    allow-unfree = true;
  };
}
