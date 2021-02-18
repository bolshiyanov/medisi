// Это плагин modal !


// НАЧАЛО КНОПКИ 
// Этот метод создает объект footer.appendAfter в dom дереве. В данной реализации элемент footer и 
// есть this который при помощи метода insertBefore добавляет в parentNode прототип класса Element
Element.prototype.appendAfter = function (element) {
    element.parentNode.insertBefore(this, element.nextSibling);
}

// Пустая функция
function noop() { }

function _creatModalFooter(buttons = []) {
    if (buttons.length === 0) {
        return document.createElement('div')
    }
    // Создаем html контейнер для кнопок
    const wrap = document.createElement('div')
    wrap.classList.add('modal-footer')

    // Создаем button, если хотябы одна кнопка есть в options footerButtons 
    // которые пришли из index.js или из confirm.js при помощи forEach для перебора массива 
    buttons.forEach(btn => {
        //Реализация плагина $btn
        const $btn = document.createElement('button')
        $btn.textContent = btn.text
        $btn.classList.add('btn')
        $btn.classList.add(`btn-${btn.type || 'secondary'}`)
        $btn.onclick = btn.handler || noop
    // Встраиваем кнопки в контейнер
        wrap.appendChild($btn)
    })
    // Отрисовываем в dom дереве
    return wrap
}
// КОНЕЦ КНОПКИ


// С помощью _createModal этой приватной функуции мы генерируем  модальное окна, а динамический контент получен 
// из плагина modal 
function _createModal(options) {
    const DEFAULT_WIDTH = '400px'
    // Здесь мы определяем константу, которая получает в себя автоматически сгенерированный html 
    // для шаблона модального окна
    const modal = document.createElement('div')
    // Подключаем css класс vmodal
    modal.classList.add('vmodal')
    // Определяем шаблон  html для модального окна
    modal.insertAdjacentHTML('afterbegin', `
    <div class="modal-overlay" data-close="true">
      <div class="modal-window" style="width": ${options.width || DEFAULT_WIDTH}>
        <div class="modal-header">
          <span class="modal-title">${options.title || 'Текст по умолчанию'}</span>
          ${options.closable ? `<span class="modal-close" data-close="true">&times;</span>` : ''}
        </div>
        <div class="modal-body" data-content> ${options.content || ''}
        </div>
      </div>
    </div>
  `)
    // Здесь мы определяем константу, которая получает сгенерированный динамический footer
    const footer = _creatModalFooter(options.footerButtons)
    // Здесь мы определяем после какого элемента нужно встроить footer в html модального окна,
    // а именно полсле div с querySelector('[data-content')
    footer.appendAfter(modal.querySelector('[data-content'))
    document.body.appendChild(modal)
    return modal
}

// Вызываем функцию замыкания 
$.modal = function (options) {
    const ANIMATION_SPEED = 200
    // Здесь $modal передает свои свойства, которые он получил на странице index.js,
    // в функцию _createModal в ее (options)
    const $modal = _createModal(options)
    
    //Чтобы перезаписывать константы должны быть let
    let closing = false
    let destroyed = false

    // Описываем открытие и закрытие модального окна за счет изменения стилей css
    const modal = {
        open() {
            // Чтобы избегать потенциальных утечек памяти в крупных проектах нужно удалять методы у удаленных объктов.
            if (destroyed) {
                console.log('Modal is destroyed')
            }
            // Так как у нас есть задержка при закрытии окна, из-за того что  наша анимация длится 200ms, 
            // то нам нужно запретить присвоение класса .open пока длится анимация
            !closing && $modal.classList.add('open')
        },
        close() {
            closing = true
            $modal.classList.remove('open')
            $modal.classList.add('hide')
            setTimeout(() => {
                $modal.classList.remove('hide')
                closing = false
                // Так как при каждом закрытии окна у нас остается модальное окно в dom,
                // что приводит к утечке памяти, реализуем Hook onClose 
                // для удаления Vmodal из Dom дерева: 
                // Учитывая, что у нас есть метод close и есть таймаут мы спрашиваем есть ли в прототипе метод
                // onClose и являетсяли он функцией и если true , то передаем в options значение onClose
                if (typeof options.onClose === 'function') {
                    options.onClose()
                }
                // Конец Хука тут

            }, ANIMATION_SPEED)

        }
    }

    // dataset получает значение true из атрибута data в строке 51 и 55. Если в dataset есть close 
    // то вызываем метод modal.close() и закрываем модальное окно
    const listner = event => {
        if (event.target.dataset.close) {
            modal.close()
        }
    }
    
    // Здесь представлен правильный способ удаления слушателя и для этого мы добавляем listner в саму ноду, 
    // чтобы позже мы согли удалить слушателя. Стоит обратить внимание, что это работает потому, что мы с вами находимся в замыкании.
    $modal.addEventListener('click', listner)
 
    // Наиважнейшей задачей в js является очистка dom дерева модального окна и его слушателя тогда, когда окно уже закрыто.
    // Для этого мы добавляем к объекту modal метод destroy  прямо в return с помощью Object.assign
    return Object.assign(modal, {
        destroy() {
            // Чтобы убрать объект modal из dom дерева мы обращаемся к ноде $modal (к его parentNode) и вызываем метод removeChild и удаляем mode.
            // Это обычный метод удаления ноды объектов из dom дерева и он может быть использован всегда.
            $modal.parentNode.removeChild($modal)
            // Во избежании потенциальных утечек памяти всегда удаляем слушателя события из закрытых и удаленных dom элементов.
            $modal.removeEventListener('click', listner)
            destroyed = true
        },

        //Контент полученый из index.html встраивается в шаблон как html
        setContent(html) {
            $modal.querySelector('[data-content]').innerHTML = html
        }
    })
}
