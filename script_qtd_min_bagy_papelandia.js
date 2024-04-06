console.log('aaaaaaaa disgraça');
function _apx_getCookie(cookieName) {
    var name = cookieName + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var cookieArray = decodedCookie.split(';');
    for(var i = 0; i < cookieArray.length; i++) {
        var cookie = cookieArray[i];
        while (cookie.charAt(0) == ' ') {
            cookie = cookie.substring(1);
        }
        if (cookie.indexOf(name) == 0) {
            return cookie.substring(name.length, cookie.length);
        }
    }
    return "";
}

function apx_updateCart(ref){
    var dcCartValue = _apx_getCookie("_dc_cart");

    // Concatenar o valor do cookie à URL
    var url = "https://api-checkout.app.dooca.store/checkout/carts/" + dcCartValue+"?apx=true";

    // Configurar os headers da solicitação
    var headers = new Headers();
    headers.append("shopid", "149147");
    headers.append("Content-Type", "application/json"); // Adicionando cabeçalho Content-Type

    // Fazer a solicitação GET usando fetch
    fetch(url, {
      method: "GET",
      headers: headers
    })
      .then(function(response) {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(function(data) {
          var items = data.items;
          // Iterar sobre os itens do carrinho
          var newItems = [];
          var flag = false;
          items.forEach(function(item) {
              // Ler o campo product_id
              //var newItem = {...item}
              console.log(`item`,item)
              var productId = item.product_id;
              // Pesquisar no localStorage por 'dc_product' + product_id
              var localStorageKey = 'dc_product_' + productId;
              var productMinQuantity = localStorage.getItem(localStorageKey);
              // Verificar se o item existe no localStorage e se min_quantity é diferente de 1
              if (productMinQuantity) {
                  productMinQuantity = parseInt(productMinQuantity);
                  if (productMinQuantity !== 1) {
                      if(item.balance > productMinQuantity){
                            if(item.quantity < productMinQuantity){
                                item.quantity = productMinQuantity;
                                flag=true;
                              console.log('set min');
                            }else{
                                var division = item.quantity/productMinQuantity;
                                var decimal = division % 1;
                                if(decimal > .5){
                                  console.log('decimal up');
                                    division = Math.floor(division);
                                    flag = true
                                }if(decimal > 0 && decimal < .5){
                                  console.log('decimal down');
                                    division = Math.ceil(division);
                                    flag = true
                                }
                                item.quantity = division * productMinQuantity;
                            }
                      }
                  }
              }
              //console.log('data alterado',data, 'flag',flag)
              newItems.push(item)              
          });
          //console.log('items',data.items)
          if(flag == true && newItems.length > 0){
            fetch(url, {
                  method: "PUT",
                  headers: headers,
                  body: JSON.stringify({items:newItems})
            })
              .then(function(response) {
                if (!response.ok) {
                  throw new Error('Network response was not ok');
                };
                return response.json();
              })
              .then(function(data) {
                window.location.reload();
              })
              .catch(function(error) {
                console.error('There was a problem with the fetch operation:', error);
              });
          }       
      })
      .catch(function(error) {
        console.error('There was a problem with the fetch operation:', error);
      });
};

// Função para lidar com a resposta compvara da solicitação AJAX
function handleAjaxCompvare(xhr) {
    if (xhr.readyState === 4 && xhr.status >= 200 && xhr.status < 300) {
        // Verifica se a URL contém '/checkout/carts', se possui o parâmetro '?apx' e se o método é PUT
        var url = xhr.responseURL;
        console.log(url);
        if (url.includes('/checkout/carts') && !url.includes('?apx') && xhr.method === 'PUT') {
            // Aqui você pode executar ações que deseja realizar após a conclusão da solicitação AJAX
            console.log('Carrinho atualizado. Carregando função...');
            apx_updateCart();
        }
    }
}

// Adiciona um listener de eventos de mudança de estado para todas as solicitações AJAX
function addAjaxCompvareListener() {
    var originalOpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function(method, url) {
        this.method = method; // Armazena o método da solicitação na instância de XMLHttpRequest
        this.addEventListener('readystatechange', function() {
            handleAjaxCompvare(this);
        });
        originalOpen.apply(this, arguments);
    };
}

// Chama a função para adicionar o listener de eventos de mudança de estado para todas as solicitações AJAX

//document.addEventListener('DOMContentLoaded', function () {
console.log(`patoname`, window.location.pathname) 
if(window.location.pathname.includes('/carrinho')){
    console.log('aiii caraio')
    addAjaxCompvareListener();
    apx_updateCart();
  }
//}, false);