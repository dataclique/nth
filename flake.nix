{
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-24.11";
    flake-utils.url = "github:numtide/flake-utils";

    git-hooks.url = "github:cachix/git-hooks.nix";
    git-hooks.inputs.nixpkgs.follows = "nixpkgs";

    devenv.url = "github:cachix/devenv";
    devenv.inputs = {
      nixpkgs.follows = "nixpkgs";
      git-hooks.follows = "git-hooks";
    };

    fenix.url = "github:nix-community/fenix";
    fenix.inputs.nixpkgs.follows = "nixpkgs";

    sui.url = "github:MystenLabs/sui";
    sui.flake = false;
  };

  outputs =
    { self, nixpkgs, flake-utils, git-hooks, devenv, fenix, ... }@inputs:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = import nixpkgs {
          inherit system;
          overlays = [ fenix.overlays.default ];
        };

        suiPkg = with pkgs;
          let
            baseUrl = "https://github.com/MystenLabs/sui/releases/download";
            version = "v1.44.2";
            zipUrl = if stdenv.isDarwin then {
              url =
                "${baseUrl}/testnet-${version}/sui-testnet-${version}-macos-x86_64.tgz";
              hash = "sha256-YexIgvq9zaeRqgMP1fkroj1tmRyUtcKjuktOYdjwFF0=";
              stripRoot = false;
            } else {
              url =
                "${baseUrl}/testnet-${version}/sui-testnet-${version}-ubuntu-x86_64.tgz";
              hash = "sha256-DoKlS75LpK2G2pKl6xgF1YHQ5Ys7QPTt3WrWFNeXzzU=";
              stripRoot = false;
            };

          in stdenv.mkDerivation {
            name = "sui";
            src = fetchzip zipUrl;
            installPhase = ''
              mkdir -p $out/bin
              cp -v sui $out/bin
            '';
          };

        toolchain = fenix.packages.${system}.stable;
        # rustPlatform = pkgs.makeRustPlatform {
        #   cargo = channel.toolchain;
        #   rustc = channel.toolchain;
        # };

        hooks = {
          nil.enable = true;
          nixfmt-classic.enable = true;
          eslint.enable = true;
          prettier.enable = true;
          taplo.enable = true;
          rustfmt = {
            enable = true;
            packageOverrides = { inherit (toolchain) cargo rustfmt; };
            settings.config-path = "backend/rustfmt.toml";
            settings.manifest-path = "backend/Cargo.toml";
          };
        };

        env = { };
        src = ./.;

      in {
        devShells.default = devenv.lib.mkShell {
          inherit inputs pkgs;
          modules = [{
            # https://devenv.sh/reference/options/
            packages = [ suiPkg ];
            enterShell = "ln -s ${inputs.sui} .sui-repo";

            languages = {
              nix.enable = true;
              javascript.enable = true;
              javascript.pnpm.enable = true;
              typescript.enable = true;
              rust = {
                enable = true;
                channel = "stable";
                inherit toolchain;
              };
            };

            inherit env;
            git-hooks = { inherit hooks; };
            difftastic.enable = true;
            cachix.enable = true;
          }];
        };

        checks.git-hooks = git-hooks.lib.${system}.run { inherit hooks src; };
        packages.devenv-up =
          self.devShells.${system}.default.config.procfileScript;
      });

  nixConfig = {
    extra-substituters = "https://devenv.cachix.org";
    extra-trusted-public-keys =
      "devenv.cachix.org-1:w1cLUi8dv3hnoSPGAuibQv+f9TZLr6cv/Hm9XgU50cw=";
    allow-unfree = true;
  };
}
