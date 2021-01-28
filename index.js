// Это главная страница 

// Здесь отрисован статический массив для использования в приложении. В боевом приложении этот массив дожен быть получен с сервера.
let fruits = [
    { id: 1, title: 'Яблоки', price: 20, img: 'https://7ogorod.ru/wp-content/uploads/2018/09/bd0db605aee5bfe315ae429559447695_big.jpeg' },
    { id: 2, title: 'Апельсины', price: 30, img: 'https://live.staticflickr.com/65535/49098795842_af0d66f74c_b.jpg' },
    { id: 3, title: 'Манго', price: 40, img: 'https://samui-site.ru/wp-content/uploads/2019/01/ExternalLink_shutterstock_388186099-768x619.jpg' }
]

//Здесь генерируется html разметка с данными из объектов массива fruits
const toHTML = fruit => `
    <div class="card">
        <img class="cardj-img-top" style="height: 300px;"
          src="${fruit.img}" alt="${fruit.title}" class="card-img-top"/>
        <div class="card-body">
          <h5 class="card-title">${fruit.title}</h5>
          <a href="#" class="btn btn-primary" data-btn="price" data-id=${fruit.id}>Посмотроеть цену</a>
          <a href="#" class="btn btn-danger" data-btn="remove" data-id=${fruit.id}>Удалить</a>
        </div>
    </div>
      `
//Здесь встраивается html разметка для div #fruits на index.html   
function render() {
    const html = fruits.map(toHTML).join('')
    document.querySelector('#fruits').innerHTML = html
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
    
    const fruit = fruits.find(f => f.id === id)

   // Обращение к кнопке у которой data атрибут равен price и добавление текста в сontent плагина modalчерез setContent
    if (btnType === "price") {
        priceModal.setContent(`
        <p>Цена на ${fruit.title}: <strong>${fruit.price}$</strong></p>
        `)
        priceModal.open()
    } 
    
    // Обращение к кнопке у которой data атрибут равен remove
    else if (btnType === "remove") {
        // Здесь мы обращаемся к плагину confirm и передаем текст ему в content через options. 
        // Плагин откроется автоматически, так как в нем внутри определен метод modal.open
        $.confirm({
            title: 'Вы уверены?',
            content: `
            <p>Вы удаляете фрукт <strong>${fruit.title}</strong></p>
            `
        }).then(() => {
            // Здесь происходит удаление объекта из массива fruits 
            // Для этого мы переопределяем массив или можно сказать перезаписываем его заново.
            // Новый массив fruits будет состоять из объектов старого массива fruitsв которых 
            // нет id который совпал с id на кнопке с типом remove
            fruits = fruits.filter(f => f.id !== id)
            //Чтобы отрисовть новый массив fruits нужно вызвать render()
            render()
        })
        .catch(() => {
            console.log('Cancel')
        })

    }
})