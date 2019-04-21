var xhr = null;
var transportations = [];
var auto = [];
var drivers = [];
var customers = [];
var modal = document.querySelector(".modal");
var elForm = document.getElementById('form');
var form = {
    id_auto: false,
    id_driver: false,
    id_customer: false,
    transportation_from: '',
    transportation_to: '',
    price: 0
};

String.prototype.firstToUpperCase = function() {
    return this.charAt(0).toUpperCase() + this.slice(1).toLowerCase();
}

function startApp () {
    getXmlHttp();

    xhr.open('GET', 'http://api_autosalon/', true);
    xhr.onreadystatechange = () => {
        if (xhr.readyState == 4 && xhr.status == 200) {
            let res = JSON.parse(xhr.response);

            transportations = res.transportations;
            auto = res.auto;
            drivers = res.drivers;
            customers = res.customers;

            createNewRecords();
        }
    };
    xhr.send();
}

function getXmlHttp () {
    if (window.XMLHttpRequest) {
        try {
            xhr = new XMLHttpRequest();
        } catch (e){}
    } else if (window.ActiveXObject) {
        try {
            xhr = new ActiveXObject('Msxml2.XMLHTTP');
        } catch (e){
            try {
                xhr = new ActiveXObject('Microsoft.XMLHTTP');
            } catch (e){}
        }
    }

    return xhr;
}

function createNewRecords () {
    var table = document.getElementById('table');

    var createNewColumn = (columnInfo, el) => {
        let newTd = document.createElement('td');
        newTd.innerText = columnInfo;
        el.appendChild(newTd);
    };

    transportations.forEach(transportation => {
        let newTr = document.createElement('tr');
        table.appendChild(newTr);
        let fields = [
            'brand', 
            'model',
            'maximum_weight',
            'first_name',
            'last_name',
            'c_first_name',
            'c_last_name',
            'transportation_from',
            'transportation_to',
            'price'
        ];

        fields.forEach(i => {
            createNewColumn(transportation[i] || '-', newTr)
        });

        // add actions icons
        let actionTd = document.createElement('td');
        actionTd.id = 'actionTd';

        let img = (callback, name) => {
            let actImg = document.createElement('img');
            actImg.src = 'assets/'+name+'.png';
            actImg.width = 20;
            actImg.title = name;
            if (name === 'edit') { actImg.style = 'margin-right: 5px;'; };
            actImg.addEventListener('click', () => callback(transportation.t_id));
            actionTd.appendChild(actImg);
        };
        
        img(editTransportation, 'edit')
        img(deleteTransportation, 'delete')

        newTr.appendChild(actionTd)
    })
}

function toggleModal (isClose=false) {
    modal.classList.toggle("show-modal");

    if (isClose) {
        setTimeout(() => {
            resetForm()
        }, 200);
    }
}

// modal window (window)
function windowOnClick (event) {
    if (event.target === modal) {
        toggleModal(true);
    }
}
window.addEventListener("click", windowOnClick);
// close modal window

function addTransportation () {
    createFormElements();
    toggleModal();
}

function editTransportation (id) {
    let activeTransportation = transportations.filter(i => i.t_id === id)[0] || false;
    createFormElements(activeTransportation);
    toggleModal();
}

function deleteTransportation () {
    console.log('click delete')
}

function createFormElements (activeTransportation = false) {
    let formTitle = document.getElementById('title');
    formTitle.innerText = (!activeTransportation ? 'Add' : 'Edit') + ' Transportation';

    let br = () => { elForm.appendChild(document.createElement('br')) };

    let label = (title) => {
        let labelSelectAuto = document.createElement('label');
        labelSelectAuto.innerText = title;
        elForm.appendChild(labelSelectAuto);
    };

    let select = (array, fields, idTable) => {
        let selectForm = document.createElement('select');
        selectForm.addEventListener('change', () => selectItem(idTable, event));
        elForm.appendChild(selectForm);

        let emptyOption = document.createElement("option");
        emptyOption.text = '';
        selectForm.appendChild(emptyOption);

        for (let i = 0; i < array.length; i++) {
            let option = document.createElement("option");

            option.text = array[i][fields[0]] + ' ' + array[i][fields[1]];
            option.value = array[i].id;

            if (activeTransportation && activeTransportation[idTable] === array[i].id) {
                option.selected = true;
            }
            
            selectForm.appendChild(option);
        }
    };

    let input = (idTable) => {
        let inputForm = document.createElement('input');
        inputForm.id = idTable;
        if (activeTransportation && activeTransportation[idTable]) {
            inputForm.value = activeTransportation[idTable];
        }
        elForm.appendChild(inputForm)
    };

    let btn = () => {
        let btnForm = document.createElement('button');
        btnForm.innerText = !activeTransportation ? 'Add record' : 'Edit record';
        btnForm.id = 'btnForm';
        btnForm.addEventListener('click', !activeTransportation ? saveTransportation : updateTransportation);
        elForm.appendChild(btnForm);
    };

    label('Select auto: ');
    select(auto, ['brand', 'model'], 'id_auto');

    br();
    label('Select driver: ');
    select(drivers, ['first_name', 'last_name'], 'id_driver');

    br();
    label('Select customer: ');
    select(customers, ['c_first_name', 'c_last_name'], 'id_customer');

    br();
    label('Transportation from: ');
    input('transportation_from');

    br();
    label('Transportation to: ');
    input('transportation_to');
    
    br();
    label('Price: ');
    input('price');

    br();
    btn();
}

function selectItem (item, e) {
    form[item] = parseInt(e.target.options[e.target.selectedIndex].value) || false;
}

function saveTransportation () {
    getFormData();
}

function updateTransportation () {
    console.log(form)
    // потрібно доробити щоб при редагуванні дані зберігались в обєкті form
    // getFormData();
}

function getFormData () {
    form.inpFrom = document.getElementById('inpFrom').value;
    form.inpTo = document.getElementById('inpTo').value;
    form.price = document.getElementById('price').value || 0;

    for (item in form) {
        if (!form[item]) {
            if (~['idAuto', 'idCustomer', 'idDriver'].indexOf(item)) {
                alert(validFormMessage(item, 0));
                return;
            } else if (~['inpFrom', 'inpTo'].indexOf(item)) {
                alert(validFormMessage(item, 1));
                return;
            } else if (item === 'price') {
                alert(validFormMessage(item, 1));
                return;
            }
        } else if (item === 'price' && isNaN(form[item])) {
            alert(validFormMessage(item, 2));
            return;
        }
    }
}

function resetForm () {
    while (elForm.firstChild) {
        elForm.removeChild(elForm.firstChild);
    }
}

function validFormMessage (field, code = 0) {
    let naturalField = {
        'id_auto': 'auto',
        'id_customer': 'customer',
        'id_driver': 'driver',
        'transportation_from': 'transportation_from',
        'transportation_to': 'transportation_to',
        'price': 'price'
    };

    let codeError = {
        0: 'Select ' + naturalField[field] + ' from the list',
        1: 'Field ' + naturalField[field] + ' can not be empty',
        2: naturalField[field].firstToUpperCase() + ' should be a number'
    };

    return codeError[code];
}

startApp();