let doc = document;
let url = './json/signin.json';

let setUrl = function() {                                       //Название документа используется как 
    fileName = location.href.split("/").slice(-1);              //URL для генерации форм (все документы названы)
    if(fileName[0] != 'index.html')                             //в соответствии с формой
        url = './json/' + fileName[0].slice(0, -5) + '.json';
}

setUrl();

createForm(url);

//------Блоки, отвечающие за создание элементов формы------
//Создние label
let createLabel = function(item, i) {
    if(item.label != undefined || item.input.type == 'checkbox') {                       //Проверка на наличие label'ов в JSON-файле или
        let label = doc.createElement('label');                                          //чекбокса (это необходимо для корректной отрисовки
        label.htmlFor = 'input-' + i;                                                    //чекбоксов в самом низу формы)

        if(item.label != undefined)                                                      //Если лэйбл, то добавлем значение лэйбла из JSON                                                 
            label.textContent = item.label;
        if(item.input != undefined && item.input.type == 'checkbox'){                    //Если чекбокс, то добавляем класс и id для чекбокса
            label.classList.add('form-check-label');
            label.htmlFor = 'input-checkbox-' + i;
        }   
            
        return label;
    }
    else
        return '';          //Возвращаем пустую строку,
                            //если лэйблы (или чекбокс внизу формы) не прописаны в JSON  
};

//Создание input
let createInput = function(item, i) {
    let input;
    if(item.input.type == 'technology'){                       //Если тип input'a technology,
        input = doc.createElement('select');                   //то создаётся select и options к нему
        item.input.technologies.forEach(function(item, i) {
            let option = doc.createElement('option');
            option.value = 'technology-' + i;
            option.textContent = item;
            input.append(option);
        });
    }

    else if(item.input.type == 'textarea'){                    //Создаётся textarea
        input = doc.createElement('textarea');
        if(item.input.multiple)
            input.multiple = true;
    }

    else{
        input = doc.createElement('input');                    //Если не подошли условия выше, то берём тип
        input.type = item.input.type;                          //input'a из JSON
    }

    if(input.type == 'color')                                  //Если input color,         
        input.setAttribute('list', 'color-list-' + i);         //то ставим атрибут list
    
    if(item.input.required)                             //Если в JSON-файле прописан required: true
        input.required = true;                          //то записываем это значение в свойство required

    input.id = 'input-' + i;

    if(item.input.type == 'checkbox'){                  //Если чекбокс, то ставим для него 
        input.classList.add('form-check-input');        //особый класс
        input.id = 'input-checkbox-' + i;               //и id
    }   
        
    else {                                              //Если любой другой класс, то ставим
        input.classList.add('form-control');            //класс form-control

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
        div.classList.add('form-check');                                               //то к div добавлем класс специально для чебокса
    return div;
};

//Создание ссылок
let createReferences = function(data, form) {  
    if(data.references != undefined){             //Если данные о ссылках присутствуют в документе

        let divCheckbox;                          //Сюда будет помещаться div с чекбоксом и лэйблом                          
        let divRefs;                              //А сюда все остальные указанные ссылки
        let ulCheckbox = doc.createElement('ul');
        let ulRefs = doc.createElement('ul');
        ulRefs.classList.add('nav', 'justify-content-between');   
        data.references.forEach(function(item, i) {     //Перебираем ссылки
            let li = doc.createElement('li');

            //----Блок с чекбоксом----
            if(item.input != undefined) {               //Если в ссылках указан input,
                                                        //то создаётся чекбокс с лэйблом.
                                                        //Они помещаются в отдельный список для корректного
                                                        //отображения самого чекбокса и остальных ссылок
                let input = createInput(item, i);      
                let label = createLabel(item, i);
                divCheckbox = createFormGroup(item);

                li.append(input);
                data.references.forEach(function(_item, j){
                    if(_item['text without ref'] != undefined) {                //Если присутствует текст без ссылки
                        label.textContent = _item['text without ref'] + ' ';    //то он помещается в лэйбл
                        if(_item.ref != undefined){                             //То же самое будет и с ссылкой, если она указана
                            let ref = doc.createElement('a');
                            ref.textContent = _item.text;
                            ref.href = _item.ref;
                            label.append(ref);
                        }
                       
                        li.append(label);
                    }
                });
                
                ulCheckbox.classList.add('pl-0');
                ulCheckbox.append(li);
                divCheckbox.append(ulCheckbox);
            }

            //----Блок с ссылками----
            else if(item['text without ref'] == undefined && item.input == undefined){         //Если в JSON указаны только ссылки
                divRefs = createFormGroup(item);                                               //то отработает этот код
                let ref = doc.createElement('a');
                ref.textContent = item.text;    
                ref.name = item.ref;                //В имя ссылки так же записывается то, куда она должна вести                    
                li.classList.add('nav-item');                                                 
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

//---------------Добавление маски на поля------------------
let addMask = function(data) {                                  //Тут используеться плагин masked-input
    data.fields.forEach(function(item, i) {
        if(item.input.mask != undefined){
            let input = doc.querySelector('#input-' + i);
            input.classList.add('phone');
            input.type = 'text';
            $('#input-' + i).mask(item.input.mask);
        }
    });
};
//---------------------------------------------------------

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
            addMask(data);                                              //Добавляем маску
        });  
};
//---------------------------------------------------------
