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
    if (!transportations.length) {
        let h1 = document.createElement('h1');
        h1.id = 'table_nothing';
        h1.innerText = 'Nothing here...';

        let img = document.createElement('img');
        img.src = 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/42/Sad_smiley_yellow_simple.svg/600px-Sad_smiley_yellow_simple.svg.png';
        img.width = 300;
        img.id = 'img_nothing';

        document.body.appendChild(h1);
        document.body.appendChild(img);
        return;
    }

    var table = document.getElementById('table');
    let tr = document.createElement('tr');

    tr.className = 'columns';
    table.appendChild(tr);

    $thFields = [
        'Brand auto',
        'Model Auto',
        'Max weight',
        'Driver name',
        'Driver surname',
        'Customer name',
        'Customer surname',
        'Transportation from',
        'Transportation to',
        'Price',
        'Actions'
    ];
    $thFields.forEach(i => {
        let th = document.createElement('th');
        th.innerText = i;
        tr.appendChild(th);
    })

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
            resetDomElements(elForm)
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
        selectForm.id = idTable;
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

function selectItem (item, e, isAdd = true) {
    form[item] = isAdd
        ? parseInt(e.target.options[e.target.selectedIndex].value) || false
        : parseInt(e.options[e.selectedIndex].value) || false;
}

function saveTransportation () {
    if (getFormData()) {
        xhr.open('POST', 'http://api_autosalon/', true);
        xhr.onreadystatechange = () => {
            if (xhr.readyState == 4 && xhr.status == 200) {
                let res = JSON.parse(xhr.response);
                if (res.success) {
                    transportations.push(res.transtortation)

                    resetDomElements(document.getElementById('table'));
                    createNewRecords()

                    alert(res.message)
                } else {
                    alert(res.message)
                }
            } else {
                console.log('Server Error')
            }
        };
        
        var formData = new FormData();

        for (item in form) {
            formData.append(item, form[item]);
        }
        
        xhr.send(formData);
    }
}

function updateTransportation () {
    if (getFormData()) {
        console.log('edit')
    }   
}

function deleteTransportation () {
    console.log('click delete')
}

function getFormData () {
    selectItem('id_auto', document.getElementById('id_auto'), false);
    selectItem('id_customer', document.getElementById('id_customer'), false);
    selectItem('id_driver', document.getElementById('id_driver'), false);

    form.transportation_from = document.getElementById('transportation_from').value;
    form.transportation_to = document.getElementById('transportation_to').value;
    form.price = document.getElementById('price').value || 0;

    for (item in form) {
        if (!form[item]) {
            if (~['id_auto', 'id_customer', 'id_driver'].indexOf(item)) {
                alert(validFormMessage(item, 0));
                return false;
            } else if (~['transportation_from', 'transportation_to'].indexOf(item)) {
                alert(validFormMessage(item, 1));
                return false;
            } else if (item === 'price') {
                alert(validFormMessage(item, 1));
                return false;
            }
        } else if (item === 'price' && isNaN(form[item])) {
            alert(validFormMessage(item, 2));
            return false;
        }
    }

    return true;
}

function resetDomElements (el) {
    // need reset playcholder nothing here...
    while (el.firstChild) {
        el.removeChild(el.firstChild);
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