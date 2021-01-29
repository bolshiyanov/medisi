// Это главная страница  !

// Здесь отрисован статический массив для использования в приложении. В боевом приложении этот массив дожен быть получен с сервера.
let items = [
    { id: 1, title: 'Яблоки', price: 20, img: 'https://7ogorod.ru/wp-content/uploads/2018/09/bd0db605aee5bfe315ae429559447695_big.jpeg' },
    { id: 2, title: 'Апельсины', price: 30, img: 'https://live.staticflickr.com/65535/49098795842_af0d66f74c_b.jpg' },
    { id: 3, title: 'Манго', price: 40, img: 'https://samui-site.ru/wp-content/uploads/2019/01/ExternalLink_shutterstock_388186099-768x619.jpg' }
]

//Здесь генерируется html разметка с данными из объектов массива items
const toPromoHTML = item => `
    <div class="card">
        <img class="cardj-img-top" style="height: 300px;"
          src="${item.img}" alt="${item.title}" class="card-img-top"/>
        <div class="card-body">
          <h5 class="card-title">${item.title}</h5>
          <a href="#" class="btn btn-primary" data-btn="promo" data-id=${item.id}>Посмотроеть цену</a>
        </div>
    </div>
      `
//Здесь встраивается html разметка для div #items на index.html   
function render() {
    const html = items.map(toPromoHTML).join('')
    document.querySelector('#promo').innerHTML = html
}
// Чтобы созданный html был отрисован в index.html нужно вызвать метод render()
render()

// Здесь формируется контент для плагина modal и пробрасывается в options плагин modal
const priceModal = $.modal({
    title: 'Цена на товар',
    closable: true,
    width: '400px',
    footerButtons: [
        {
            text: 'Закрыть', type: 'primary', handler() {
                priceModal.close()
            }
        }
    ]
})
// Прослушиваем click и ловим event который мы определили в строках 15 и 16 в атрибутах data
document.addEventListener('click', event => {
    event.preventDefault()
    const btnType = event.target.dataset.btn
    // Чтобы поиск по id сработал мы должны переопределить 
    // его в тип Number поэтому добавляем + 
    const id = +event.target.dataset.id
    
    const item = items.find(f => f.id === id)

   // Обращение к кнопке у которой data атрибут равен price и добавление текста в сontent плагина modalчерез setContent
    if (btnType === "promo") {
        priceModal.setContent(`
        <p>Цена на ${item.title}: <strong>${item.price}$</strong></p>
        `)
        priceModal.open()
    } 
    
    
})
