angular.module("hackaton-stefanini").controller("PessoaIncluirAlterarController", PessoaIncluirAlterarController);
PessoaIncluirAlterarController.$inject = [
    "$rootScope",
    "$scope",
    "$location",
    "$q",
    "$filter",
    "$routeParams",
    "HackatonStefaniniService"];

function PessoaIncluirAlterarController(
    $rootScope,
    $scope,
    $location,
    $q,
    $filter,
    $routeParams,
    HackatonStefaniniService) {

    /**ATRIBUTOS DA TELA */
    vm = this;
    vm.selectedValues = [];
    vm.pessoa = {
        id: null,
        nome: "",
        email: "",
        dataNascimento: null,
        enderecos: [],
        perfils: [],
        situacao: false
    };
    vm.enderecoDefault = {
        id: null,
        idPessoa: null,
        cep: "",
        uf: "",
        localidade: "",
        bairro: "",
        logradouro: "",
        complemento: ""
    };

    vm.urlEndereco = "http://localhost:8080/treinamento/api/enderecos/";
    vm.urlPerfil = "http://localhost:8080/treinamento/api/perfils/";
    vm.urlPessoa = "http://localhost:8080/treinamento/api/pessoas/";
    vm.urlEnderecoViaCEP = "http://localhost:8080/treinamento/api/enderecos/cep/"

    /**METODOS DE INICIALIZACAO */
    vm.init = function () {
 
        vm.tituloTela = "Cadastrar Pessoa";
        vm.acao = "Cadastrar";


        /**Recuperar a lista de perfil */
        vm.listar(vm.urlPerfil).then(
            function (response) {
                if (response !== undefined) {
                    vm.listaPerfil = response;
                    if ($routeParams.idPessoa) {
                        vm.tituloTela = "Editar Pessoa";
                        vm.acao = "Editar";

                        vm.recuperarObjetoPorIDURL($routeParams.idPessoa, vm.urlPessoa).then(
                            function (pessoaRetorno) {
                                if (pessoaRetorno !== undefined) {
                                    vm.pessoa = pessoaRetorno;
                                    
                                }
                            }
                        );
                    }
                }
            }
        );
    };

    /**METODOS DE TELA */
    vm.cancelar = function () {
        vm.retornarTelaListagem();
    };

    vm.retornarTelaListagem = function () {
        $location.path("listarPessoas");
    };

    vm.abrirModal = function (endereco) {
        vm.acaoEndereco = "editar";

        if(endereco == 'Novo'){
            vm.enderecoModal = undefined;
            vm.acaoEndereco = "novo";
        }

        if(vm.acaoEndereco == "editar"){
        vm.enderecoModal = vm.enderecoDefault;
        if (endereco !== undefined)
            vm.enderecoModal = endereco;

        if (vm.pessoa.enderecos.length === 0)
            vm.pessoa.enderecos.push(vm.enderecoModal);
        }

        $("#modalEndereco").modal();
    };

    vm.limparTela = function () {
        
        alert("Olá")
        $("#modalEndereco").modal("toggle");
        vm.endereco = undefined;
    };

    vm.incluirEndereco  = function (){
        if(vm.acaoEndereco == "novo"){

            if(vm.enderecoModal.bairro == ""){
                vm.enderecoModal.bairro = "Vazio";
            }
            if(vm.enderecoModal.complemento == ""){
                vm.enderecoModal.complemento = "Vazio";
            }
            if(vm.enderecoModal.logradouro == ""){
                vm.enderecoModal.logradouro = "Vazio";
            }

            vm.pessoa.enderecos.push(vm.enderecoModal);
        }
    };

    vm.buscarEndereco  = function (){

        vm.recuperarObjetoPorIDURL(vm.enderecoModal.cep, vm.urlEnderecoViaCEP).then(
            function (enderecoRetorno) {
                if (enderecoRetorno !== undefined) {

                    vm.enderecoModal = enderecoRetorno;

                    if(vm.enderecoModal.cep !== undefined){
                        alert("CEP válido!");
                    }
                    else{
                        alert("CEP inválido!");
                        vm.enderecoModal = undefined;
                    }    
                }
                
            }
        );
        
    };

    vm.incluir = function () {
        

        var objetoDados = angular.copy(vm.pessoa);
        var listaEndereco = [];
        angular.forEach(objetoDados.enderecos, function (value, key) {
           
                value.idPessoa = objetoDados.id;
                listaEndereco.push(angular.copy(value));
           
        });

        objetoDados.enderecos = listaEndereco;

        for(var i = 0, len = vm.selectedValues.length; i < len; ++i) {
            var isNovoPerfil = true;
            angular.forEach(objetoDados.perfils, function (value, key) {
                if (value.id === vm.selectedValues[i].id) {
                    objetoDados.perfils.splice(i,1);
                    isNovoPerfil = false;
                }
            });
            if (isNovoPerfil)
            objetoDados.perfils.push(vm.selectedValues[i]);
          }
      
        alert(vm.selectedValues.length);
        if (vm.acao == "Cadastrar") {

            vm.salvar(vm.urlPessoa, objetoDados).then(
                function (pessoaRetorno) {
                    vm.retornarTelaListagem();
                });
        } else if (vm.acao == "Editar") {
         
            vm.alterar(vm.urlPessoa, objetoDados).then(
                function (pessoaRetorno) {
                    vm.retornarTelaListagem();
                });
        }
    };

    vm.remover = function (objeto, tipo) {

        var url = vm.urlPessoa + objeto.id;
        if (tipo === "ENDERECO")
            url = vm.urlEndereco + objeto.id;

        vm.excluir(url).then(
            function (ojetoRetorno) {
                vm.retornarTelaListagem();
            });
    };

    /**METODOS DE SERVICO */
    vm.recuperarObjetoPorIDURL = function (id, url) {

        var deferred = $q.defer();
        HackatonStefaniniService.listarId(url + id).then(
            function (response) {
                if (response.data !== undefined)
                    deferred.resolve(response.data);
                else
                    deferred.resolve(vm.enderecoDefault);
            }
        );
        return deferred.promise;
    };

    vm.listar = function (url) {

        var deferred = $q.defer();
        HackatonStefaniniService.listar(url).then(
            function (response) {
                if (response.data !== undefined) {
                    deferred.resolve(response.data);
                }
            }
        );
        return deferred.promise;
    }

    vm.salvar = function (url, objeto) {

        var deferred = $q.defer();
        var obj = JSON.stringify(objeto);
        HackatonStefaniniService.incluir(url, obj).then(
            function (response) {
                if (response.status == 200) {
                    deferred.resolve(response.data);
                }
            }
        );
        return deferred.promise;
    }

    vm.alterar = function (url, objeto) {

        var deferred = $q.defer();
        var obj = JSON.stringify(objeto);
        HackatonStefaniniService.alterar(url, obj).then(
            function (response) {
                if (response.status == 200) {
                    deferred.resolve(response.data);
                }
            }
        );
        return deferred.promise;
    }

    vm.excluir = function (url, objeto) {

        var deferred = $q.defer();
        HackatonStefaniniService.excluir(url).then(
            function (response) {
                if (response.status == 200) {
                    deferred.resolve(response.data);
                }
            }
        );
        return deferred.promise;
    }

    /**METODOS AUXILIARES */
    vm.formataDataJava = function (data) {
        var dia = data.slice(0, 2);
        var mes = data.slice(2, 4);
        var ano = data.slice(4, 8);

        return ano + "-" + mes + "-" + dia;
    };

    vm.formataDataTela = function (data) {
        var ano = data.slice(0, 4);
        var mes = data.slice(5, 7);
        var dia = data.slice(8, 10);

        return dia + mes + ano;
    };

    vm.listaUF = [
        { "id": "RO", "desc": "RO" },
        { "id": "AC", "desc": "AC" },
        { "id": "AM", "desc": "AM" },
        { "id": "RR", "desc": "RR" },
        { "id": "PA", "desc": "PA" },
        { "id": "AP", "desc": "AP" },
        { "id": "TO", "desc": "TO" },
        { "id": "MA", "desc": "MA" },
        { "id": "PI", "desc": "PI" },
        { "id": "CE", "desc": "CE" },
        { "id": "RN", "desc": "RN" },
        { "id": "PB", "desc": "PB" },
        { "id": "PE", "desc": "PE" },
        { "id": "AL", "desc": "AL" },
        { "id": "SE", "desc": "SE" },
        { "id": "BA", "desc": "BA" },
        { "id": "MG", "desc": "MG" },
        { "id": "ES", "desc": "ES" },
        { "id": "RJ", "desc": "RJ" },
        { "id": "SP", "desc": "SP" },
        { "id": "PR", "desc": "PR" },
        { "id": "SC", "desc": "SC" },
        { "id": "RS", "desc": "RS" },
        { "id": "MS", "desc": "MS" },
        { "id": "MT", "desc": "MT" },
        { "id": "GO", "desc": "GO" },
        { "id": "DF", "desc": "DF" }
    ];
    

}
