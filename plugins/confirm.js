// Это плагин confirm, а именно модальное окно с удалением фрукта.
// Так как модальное окно может висеть сколько угодно долго, 
// имеет смысл обрабатывать его асинхронно. Для этого создаем 
// компонен Confirm.js внутри компонента index.js и используем Promise.

$.confirm = function (options) {
    // Промис $.confirm позволяет выполняться всему коду приложения, пока отрисовано модальное окно 
    // confirm и не нажата ни одна кнопка, продолжается выполнение программы.
    return new Promise((resolve, reject) => {
        const modal = $.modal({
            title: options.title,
            width: '400px',
            closable: false,
            content: options.content,
            // Так как при каждом закрытии окна у нас остается модальное окно в dom,
            // что приводит к утечке памяти, будем использовать Hook onClose который (был создан в modal.js)
            // для удаления Vmodal из Dom дерева, который был реализован в modal.js :
            // когда then передает true из 
            onClose() {
                modal.destroy()
            },
           // Конец реализации хука тут

            footerButtons: [
                {text: 'Отменить', type: 'secondary', handler() {
                        modal.close()
                        reject() 
                    }},
                {text: 'Удалить', type: 'danger', handler() {
                        modal.close()
                        resolve()
                    }}
            ]
        })

        // Так как модальное окно confirm открывается мгновенно, 
        // нам нужна задержка для отрисовки анимации. Поэтому добавляем таймаут.
        setTimeout(() => modal.open(), 400)
    })
}