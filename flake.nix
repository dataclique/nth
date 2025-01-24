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
  };

  outputs = { self, nixpkgs, flake-utils, git-hooks, devenv, ... }@inputs:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = import nixpkgs { inherit system; };

        suiPkg = with pkgs;
          let
            baseUrl = "https://github.com/MystenLabs/sui/releases/download";
            version = "v1.41.0";
            zipUrl = if stdenv.isDarwin then {
              url =
                "${baseUrl}/testnet-${version}/sui-testnet-${version}-macos-x86_64.tgz";
              hash = "sha256-kW+myS5V79PDgH+ZD/BJ5C+yD5XcrKrfs4MjOQv49cA=";
              stripRoot = false;
            } else {
              url =
                "${baseUrl}/testnet-${version}/sui-testnet-${version}-ubuntu-x86_64.tgz";
              hash = "";
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

        hooks = {
          # Nix
          nil.enable = true;
          nixfmt-classic.enable = true;
        };

        env = { };
        src = ./.;

      in {
        devShells.default = devenv.lib.mkShell {
          inherit inputs pkgs;
          modules = [{
            # https://devenv.sh/reference/options/
            packages = [ suiPkg ];

            languages = { nix.enable = true; };

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
