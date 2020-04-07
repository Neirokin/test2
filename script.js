let doc = document;
let url = './json/signin.json';

let setUrl = function() {
    fileName = location.href.split("/").slice(-1);
    url = './json/' + fileName[0].slice(0, -5) + '.json';
}

setUrl();
                       //Глобальная переменная с адресом необхожимого файла
// let typeList = ['button', 'checkbox', 'file', 'hidden', 'image', 'password', 'radio', 'reset', 'submit', 'text'];
                                                        //(в дальнейшем будет перезаписываться)
//Первый вызов формы (создаёт login страницу)
createForm(url);


//------Блоки, отвечающие за создание элементов формы------
//Создние label
let createLabel = function(item, i) {
    if(item.label != undefined || item.input.type == 'checkbox') {                       //проверка на наличие label'ов
        let label = doc.createElement('label');         //в JSON-файле
        label.htmlFor = 'input-' + i;
        if(item.label != undefined)
            label.textContent = item.label;
        if(item.input != undefined && item.input.type == 'checkbox'){
            label.classList.add('form-check-label');
            label.htmlFor = 'input-checkbox-' + i;
        }   
            
        return label;
    }
    else
        return '';                                      //Возвращаем пустую строку,
                                                        //если лэйблы не прописаны в JSON  
};

//Создание input
let createInput = function(item, i) {
    let input;
    if(item.input.type == 'technology'){
        input = doc.createElement('select');
        item.input.technologies.forEach(function(item, i) {
            let option = doc.createElement('option');
            option.value = 'technology-' + i;
            option.textContent = item;
            input.append(option);
        });
    }

    else if(item.input.type == 'textarea'){
        input = doc.createElement('textarea');
        if(item.input.multiple)
            input.multiple = true;
    }

    else{
        input = doc.createElement('input');
        input.type = item.input.type;
    }

    if(input.type == 'color')                           //Записываем значение в свойство list
        input.setAttribute('list', 'color-list-' + i);                 //если это colorpicker
    
    if(input.type == "number") {
        input.classList.add('phone');
    }
    
    if(item.input.required)                             //Если в JSON-файле прописан required: true
        input.required = true;                          //то записываем это значение в свойство required

    input.id = 'input-' + i;

    if(item.input.type == 'checkbox'){
        input.classList.add('form-check-input');
        input.id = 'input-checkbox-' + i;
    }   
        
 
    else {
        input.classList.add('form-control');
        if(item.input.placeholder != undefined)             //Проверка на наличие данных о placeholder
            input.placeholder = item.input.placeholder;     //в JSON-файле
    }
    return input;
}
//Создание обёртки (div)
let createFormGroup = function(item) {
    let div = doc.createElement('div');
    div.classList.add('form-group');                    
    if(item != undefined && item.input != undefined && item.input.type == 'checkbox')  //Если мы оборачиваем в div чекбокс,
        div.classList.add('form-check');                    //то к div добавлем класс специально для чебокса
    return div;
};

//Создание ссылок
let createReferences = function(data, form) {  
    if(data.references != undefined){             //Если данные есть данные о ссылка в JSON,
        let divCheckbox;
        let divRefs;
        let ulCheckbox = doc.createElement('ul');
        let ulRefs = doc.createElement('ul');
        ulRefs.classList.add('nav', 'justify-content-between');   
        data.references.forEach(function(item, i) {
            let li = doc.createElement('li');
            if(item.input != undefined) {
            
                let input = createInput(item, i);
                let label = createLabel(item, i);
                divCheckbox = createFormGroup(item);

                li.append(input);
                data.references.forEach(function(_item, j){
                    if(_item['text without ref'] != undefined) {
                        label.textContent = _item['text without ref'] + ' ';
                        let ref = doc.createElement('a');
                        ref.textContent = _item.text;
                        ref.href = _item.ref;
                        label.append(ref);
                        li.append(label);
                    }
                });
                
                ulCheckbox.classList.add('pl-0');
                ulCheckbox.append(li);
                divCheckbox.append(ulCheckbox);
            }

            else if(item['text without ref'] == undefined){
                divRefs = createFormGroup(item);
                let ref = doc.createElement('a');
                ref.textContent = item.text;
                ref.name = item.ref;                                //Т.к. название формы и название файла одинаково,
                                                                    //то мы записываем название форму в свойство name ссылки,
                li.classList.add('nav-item');                                                   //чтобы в дальнешем создавать указанну форму при клике на ссылку
                ref.href = item.ref + '.html';
                ref.classList.add('nav-link', 'px-0', 'json-ref'); 
                
                li.append(ref);
                ulRefs.append(li);
                divRefs.append(ulRefs);    
            }
            
        });

        if(divCheckbox != undefined)
            form.append(divCheckbox);
        if(divRefs != undefined)
            form.append(divRefs);
    }
    else
        return '';
};

//Создание кнопок
let createButtons = function(data, form) {
    if(data.buttons != undefined){                              //Если данные в JSON-файле указаны, то создаём
                                                                //кнопки на основе этих данных
        let div = createFormGroup(data);
        div.classList.add('justify-content-between', 'd-flex')
        data.buttons.forEach(function(item, i) {                //Перебор данных о кнопке
            let button = doc.createElement('button');                          
            button.textContent = item.text;
            button.classList.add('btn', 'btn-primary', 'd-flex', 'px-4');
            div.append(button);
        });   
        form.append(div);
    }
    else {                                                      //Если данных о кнопках нет,
        return '';                                              //то возвращаем пустую строку
    }
};

//Создание datalist для input с выбором цвета
let createDatalist = function(item, i) {
    let list = doc.createElement('datalist');
    list.id = 'color-list-' + i;

    item.input.colors.forEach(function(color) {                 //Перебор цветов

        let option = doc.createElement('option');               //Создаём option'ы для datalist    
        option.value = color;
        list.append(option);
    });
    
    return list;
}

 //Создание самих полей (label + input)
let createFields = function(data, form) {                               //В этой функции label'ы и input'ы оборачиваются в div
    data.fields.forEach(function(item, i) {                             
        let div = createFormGroup(item);                                //Создаём div (отправляем item для проверки, на случай если input это чекбокс)

        if(item.input.type == 'checkbox')                               //Проверка на чекбокс. Если input чекбокс, то сперва в div 
            div.append( createInput(item, i), createLabel(item, i) );   //добавляем сам чекбокс, а потом уже label, т.к. если делать наоборот,
                                                                        //то чекбокс и label неправильно отображаются и наслаиваются друг на друга    
        else {
            div.append( createLabel(item, i), createInput(item, i) );   //Если input не чекбокс, то сперва в div добавляем label, а потом input

            if(item.input.type == 'color')                              //Если input colorpicker,
                div.append( createDatalist(item, i) );                  //то  в div мы добавляем datalist со списком цветов
        }
            

        form.append( div );                                             //Добавляем поле в форму
    })
}

//---------------------------------------------------------

let addMask = function(data) {
    data.fields.forEach(function(item, i) {
        if(item.input.mask != undefined){
            let input = doc.querySelector('#input-' + i);
            input.type = 'text';
            $('#input-' + i).mask(item.input.mask);
        }
    });
};

//----------------------Создание формы---------------------
function createForm(url) {
    fetch(url)                                                          //Посылаем запрос
        .then(response => response.json())
        .then(data => {
        
            let formContainer = doc.getElementById('form-container');   //Находим div с классом form-container, именно в нём будет строиться форма
            let form = doc.createElement('form');
            form.setAttribute('name', data.name);

            createFields(data, form);                                   //Создаём поля
            createReferences(data, form);                               //Создаём ссылки                             
            createButtons(data, form);                                  //Создаём кнопки
            formContainer.append(form);                                 //Добавляем форму в контейнер
            // console.log(data);

            addMask(data);
        });  
};
//---------------------------------------------------------









//------------------------------Ссылки--------------------------
// if(data.references != undefined){                       //то мы создаём именно эти ссылки
        // let div = createFormGroup();                        //Создаём обёртку

        // let ul = doc.createElement('ul');                       //Создаём список
        // ul.classList.add('nav', 'justify-content-between');     //С бутстраповскими классами
        
        // data.references.forEach(function(item, i) {             //Перебираем ссылки в JSON-файле
        //     let li = doc.createElement('li');
        //     li.classList.add('nav-item');
                
        //     if(item.input != undefined){
        //         let div = createFormGroup(item);
        //         div.append(createInput(item, i));
        //         debugger
        //         data.references.forEach(function(value, j) { 
        //             if(value['text without ref'] != undefined){
        //                 div.append(createText(value));
        //             }
                    
        //             console.log(value);


        //         });

        //         li.append(div);
        //     }

        //     else {
        //         let ref = doc.createElement('a');
        //         ref.textContent = item.text;
        //         ref.name = item.ref;                                //Т.к. название формы и название файла одинаково,
        //                                                             //то мы записываем название форму в свойство name ссылки,
        //                                                             //чтобы в дальнешем создавать указанну форму при клике на ссылку
        //         ref.href = '#';
        //         ref.classList.add('nav-link', 'px-0', 'json-ref');  

        //         ref.onclick = function () {                         //Ставим обработчик на клик по ссылке
        //             if(ref.name != 'rememberpassword'){             //!!!!!!
        //                 form.remove();                                  //1.Очищаем форму
        //                 url = "json/"+ ref.name + ".json";              //2.Берём имя ссылки и записываем её в url (пример: url = 'json/signup.json')
        //                 createForm(url);                                //3.Создаём форму из указанного в предыдущем пункте файла
        //             }
        //         }
        //         li.append(ref);
        //     }
        //     ul.append(li);
        // });

        // let li = doc.createElement('li');                       //Т.к. нигде не был указан переход на colorscheme,
        // let ref = doc.createElement('a');                       //я добавил его к остальным ссылкам под input'ами
        // ref.textContent = 'Change color scheme';
        // ref.name = "colorscheme";
        // ref.href = "#";
        // ref.classList.add('nav-link', 'px-0', 'json-ref');
        // ref.onclick = function () {                             //Всё работает по такой же схеме, как и выше
        //     form.remove();
        //     url = './json/colorscheme.json';
        //     createForm(url);
        // }

        // li.append(ref);
        // ul.append(li);

        // div.append(ul);
        // form.append(div);
//     }
//    else {                                                       //На случай если никаких ссылок в JSON-файле не указано,
//         let div = createFormGroup();                            //(как в colorscheme.json), создаётся ссылка, ведущая обратно на
//         let ul = doc.createElement('ul');                       //на форму авторизации
//         ul.classList.add('nav', 'justify-content-between');
//         let li = doc.createElement('li');
//         let ref = doc.createElement('a');
//         ref.textContent = 'Return to Sign In';
//         ref.name = "signin";
//         ref.href = "#";
//         ref.classList.add('nav-link', 'px-0', 'json-ref');
//         ref.onclick = function () {                            
//             form.remove();
//             url = './json/signin.json';
//             createForm(url);
//         }

//         li.append(ref);
//         ul.append(li);

//         div.append(ul);
//         form.append(div);
//    }