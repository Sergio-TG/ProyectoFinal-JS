//TORRES GUAYMASI Sergio
//inicializo la variable carrito con una funcion para que detecte si existen valores previos en el storage
let carrito = cargarCarrito();
let productosJSON = [];
let cantidadTotalCompra = carrito.length;

//dentro del document ready agrego todo el codigo generado por dom
$(document).ready(function () {
  $("#cantidad-compra").text(cantidadTotalCompra);
  //evento al boton finalizar compra para que el usuario confirme su compra
  $("#btn-finalizar").on('click', function () {
    //uso sweet alert para que el usuario confirme la compra, cuando toca si se vacia el carrito
    Swal.fire({
      title: '¿Seguro que desea finalizar la compra?',
      text: `Total a abonar: $${calcularTotalCarrito()}`,
      showCancelButton: true,
      confirmButtonColor: '#008f39',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si',
      cancelButtonText: 'No'
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire(
          'La Compra ha sido procesada',
          '¡Exitos!',
          'success'
        )
        vaciarCarrito();
      }
    })
  });

  //configuracion del selector para ordenar productos
  $("#seleccion option[value='pordefecto']").attr("selected", true);
  $("#seleccion").on("change", ordenarProductos);

  $("#gastoTotal").html(`Total: $ ${calcularTotalCarrito()}`);
  obtenerJSON();
  renderizarProductos();
  mostrarEnTabla();
});

//funcion para el renderizado de los productos en cards
function renderizarProductos() {
  for (const producto of productosJSON) {
    $("#section-productos").append(`<div class="card-product"> 
                                    <div class="img-container">
                                    <img src="${producto.foto}" alt="${producto.nombre}" class="img-product"/>
                                    </div>
                                    <div class="info-producto">
                                    <p class="font">${producto.nombre}</p>
                                    <strong class="font">$${producto.precio}</strong>
                                    <button class="botones" id="btn${producto.id}"> Comprar </button>
                                    </div>
                                    </div>`);

    $(`#btn${producto.id}`).on('click', function () {
      agregarAlCarrito(producto);
      $(`#btn${producto.id}`).fadeOut(200).fadeIn(200);
    });
  }
};

//Funcion asincrona con mockapi utilizando Fetch para obtener la informacion de los productos.
async function obtenerJSON(){
  try {
    const response = await fetch(
'https://6345ebaf39ca915a690a52a9.mockapi.io/api/FS/articles'
);
    const data = await response.json();
    productosJSON = [...data];
    renderizarProductos();
  } catch (error) {
    console.log(error);
  }

}

//funcion para ordenar los productos segun precio y orden alfabetico
function ordenarProductos() {
  let seleccion = $("#seleccion").val();
  if (seleccion == "menor") {
    productosJSON.sort(function (a, b) {
      return a.precio - b.precio
    });
  } else if (seleccion == "mayor") {
    productosJSON.sort(function (a, b) {
      return b.precio - a.precio
    });
  } else if (seleccion == "alfabetico") {
    productosJSON.sort(function (a, b) {
      return a.nombre.localeCompare(b.nombre);
    });
  }
  $(".card-product").remove();
  renderizarProductos();
}

//creo una clase para cargar productos en el carrito y modificar sus cantidades
class ProductoCarrito {
  constructor(prod) {
    this.id = prod.id;
    this.foto = prod.foto;
    this.nombre = prod.nombre;
    this.precio = prod.precio;
    this.cantidad = 1;
  }
}

//funcion para agregar productos al carrito
function agregarAlCarrito(productoAgregado) {
  let encontrado = carrito.find(p => p.id == productoAgregado.id);
  if (encontrado == undefined) {
    let productoEnCarrito = new ProductoCarrito(productoAgregado);
    carrito.push(productoEnCarrito);
    Swal.fire(
      'Producto agregado con éxito a su carrito de compras',
      productoAgregado.nombre,
      'success'
    );

    //agregamos una nueva fila a la tabla de carrito en caso de que el producto no se encontrara 
    $("#tablabody").append(`<tr id='fila${productoEnCarrito.id}' class='tabla-carrito'>
                            <td> ${productoEnCarrito.nombre}</td>
                            <td id='${productoEnCarrito.id}'> ${productoEnCarrito.cantidad}</td>
                            <td> ${productoEnCarrito.precio}</td>
                            <td><button class='btn btn-light' id="btn-eliminar-${productoEnCarrito.id}">🗑️</button></td>
                            </tr>`);

  } else {
    //pido al carro la posicion del producto y despues incremento su cantidad
    let posicion = carrito.findIndex(p => p.id == productoAgregado.id);
    carrito[posicion].cantidad += 1;
    $(`#${productoAgregado.id}`).html(carrito[posicion].cantidad);
  }

  $("#gastoTotal").html(`Total: $ ${calcularTotalCarrito()}`);
  localStorage.setItem("carrito", JSON.stringify(carrito));
  mostrarEnTabla();
}

//funcion para rehacer la tabla del modal cada vez que se refresca la pagina y eliminar productos del carrito
function mostrarEnTabla() {
  $("#tablabody").empty();
  for (const prod of carrito) {
    $("#tablabody").append(`<tr id='fila${prod.id}' class='tabla-carrito'>
                            <td> ${prod.nombre}</td>
                            <td id='${prod.id}'> ${prod.cantidad}</td>
                            <td> ${prod.precio}</td>
                            <td><button class='btn btn-light' id="eliminar${prod.id}">🗑️</button></td>
                            </tr>`);

    $(`#eliminar${prod.id}`).click(function () {
      let eliminado = carrito.findIndex(p => p.id == prod.id);
      carrito.splice(eliminado, 1);
      console.log(eliminado);
      $(`#fila${prod.id}`).remove();
      $("#gastoTotal").html(`Total: $ ${calcularTotalCarrito()}`);
      localStorage.setItem("carrito", JSON.stringify(carrito));
    })
  }
};

//funcion para calcular el monto total del carrito y la cantidad
function calcularTotalCarrito() {
  let total = 0;
  for (const producto of carrito) {
    total += producto.precio * producto.cantidad;
  }
  $("#montoTotalCompra").text(total);
  $("#cantidad-compra").text(carrito.length);
  return total;
}

//funcion que resetea todos los valores una vez finalizada la compra 
function vaciarCarrito() {
  $("#gastoTotal").text("Total: $0");
  $("#cantidad-compra").text("0");
  $(".tabla-carrito").remove();
  localStorage.clear();
  carrito = [];
}

//funcion para traer el carrito cargado cada vez que se refresca la pagina
function cargarCarrito() {
  let carrito = JSON.parse(localStorage.getItem("carrito"));
  if (carrito == null) {
    return [];
  } else {
    return carrito;
  }
}
