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
    price: 0,
    departure_date: '',
    date_of_arrival: ''
};
var limit = 5;
var offset = 0;

String.prototype.firstToUpperCase = function() {
    return this.charAt(0).toUpperCase() + this.slice(1).toLowerCase();
}

function startApp (isDrowPaginations = true) {
    getXmlHttp();
    let getParams = '?limit=' + limit + '&offset=' + offset;
    xhr.open('GET', 'http://api_autosalon' + getParams, true);
    xhr.onreadystatechange = () => {
        if (xhr.readyState == 4 && xhr.status == 200) {
            let res = JSON.parse(xhr.response);

            transportations = res.transportations;
            auto = res.auto;
            drivers = res.drivers;
            customers = res.customers;

            createNewRecords();
            if (isDrowPaginations) { createPaginations(res.count); }
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
        let div = document.createElement('div');
        div.id = 'divPlaceholder';
        document.body.appendChild(div);

        let h1 = document.createElement('h1');
        h1.id = 'table_nothing';
        h1.innerText = 'Nothing here...';

        let img = document.createElement('img');
        img.src = 'assets/placholder.png';
        img.width = 300;
        img.id = 'img_nothing';

        div.appendChild(h1);
        div.appendChild(img);

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
        'Departure date',
        'Date of arrival date',
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
            'price',
            'departure_date',
            'date_of_arrival'
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
        btnForm.addEventListener('click', !activeTransportation ? saveTransportation : updateTransportation.bind(null, activeTransportation));
        elForm.appendChild(btnForm);
    };

    let datePicker = (id, value) => {
        let datePickerDeparture = document.createElement('input');
        datePickerDeparture.type = 'datetime-local';

        datePickerDeparture.value = value.split(' ').join('T');

        datePickerDeparture.id = id;
        elForm.appendChild(datePickerDeparture);
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

    // create date picker
    br();
    label('Departure date: ');
    datePicker('date1', activeTransportation.departure_date || '');

    br();
    label('Date of arrival: ');
    datePicker('date2', activeTransportation.date_of_arrival || ''); 

    br();
    btn();
}

function selectItem (item, e, isAdd = true) {
    form[item] = isAdd
        ? parseInt(e.target.options[e.target.selectedIndex].value) || false
        : parseInt(e.options[e.selectedIndex].value) || false;
}

function saveTransportation () {
    if (!chekedCorrectDate()) { return false; }

    if (getFormData()) {
        xhr.open('POST', 'http://api_autosalon/', true);
        xhr.onreadystatechange = () => {
            if (xhr.readyState == 4 && xhr.status == 200) {
                let res = JSON.parse(xhr.response);
                if (res.success) {
                    location.reload()
                    // transportations.push(res.transtortation)

                    // resetDomElements(document.getElementById('table'));
                    // let divPlaycholder = document.getElementById('divPlaceholder');

                    // if (divPlaycholder) {
                    //     // delete placholder
                    //     resetDomElements(divPlaycholder);
                    // }

                    // // create recode
                    // createNewRecords()

                    // // close modal
                    // toggleModal(true);
                    // showValidMessage('New record added', 'success');
                } else {
                    alert(res.message)
                }
            }
        };
        
        var formData = new FormData();

        for (item in form) {
            formData.append(item, form[item]);
        }
        
        xhr.send(formData);
    }
}

function updateTransportation (activeTransportation) {
    if (!chekedCorrectDate()) { return false; }

    if (getFormData()) {
        xhr.open('PUT', 'http://api_autosalon/?id='+activeTransportation.t_id, true);
        xhr.onreadystatechange = () => {
            if (xhr.readyState == 4 && xhr.status == 200) {
                let res = JSON.parse(xhr.response);
                
                if (res.success) {
                    location.reload()
                }
            }
        };

        xhr.send(JSON.stringify(form));
    }
}

function deleteTransportation (id) {
        xhr.open('DELETE', 'http://api_autosalon?id='+id, true);
        xhr.onreadystatechange = () => {
            if (xhr.readyState == 4 && xhr.status == 200) {
                let res = JSON.parse(xhr.response);

                if (res.success) {
                    location.reload();
                }
            }
        };
        
        xhr.send();
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
                showValidMessage(validFormMessage(item, 0));
                return false;
            } else if (~['transportation_from', 'transportation_to'].indexOf(item)) {
                showValidMessage(validFormMessage(item, 1));
                return false;
            } else if (item === 'price') {
                showValidMessage(validFormMessage(item, 1));
                return false;
            }
        } else if (item === 'price' && isNaN(form[item])) {
            showValidMessage(validFormMessage(item, 2));
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
        'transportation_from': 'Transportation from',
        'transportation_to': 'Transportation to',
        'price': 'price'
    };

    let codeError = {
        0: 'Select ' + naturalField[field] + ' from the list',
        1: 'Field ' + naturalField[field] + ' can not be empty',
        2: naturalField[field].firstToUpperCase() + ' should be a number'
    };

    return codeError[code];
}

function chekedCorrectDate () {
    let date1 = document.getElementById('date1');
    let date2 = document.getElementById('date2');

    if (!date1.value || !date2.value) {
        showValidMessage('Please enter a valid date');
        return false;
    }

    form.departure_date = date1.value;
    form.date_of_arrival = date2.value;

    return true;
}

var showValidMessage = (message, type = 'danger') => {
    new Toast({
        message: message,
        type: type
    });
};

function createPaginations (allCountTransportations) {
    if (allCountTransportations) {
        let wrapper = document.getElementById('wrapper');
        let ul = document.createElement('ul');
        ul.id = 'ulNumberPaginations';
        wrapper.appendChild(ul);

        let iteration = Math.ceil(allCountTransportations / limit);
        for (let i = 0; i < iteration; i++) {
            let li = document.createElement('li');
            if (i === 0) {
                li.id = 'pagActive';
            }

            let newOffset = i * limit;
            li.addEventListener('click', test.bind(null, newOffset, li));

            li.innerText = 1 + i;

            ul.appendChild(li);
        }
    }
}

function test(newOffset, el) {
    offset = newOffset
    
    replacementNumberPaginations(el);
    resetDomElements(document.getElementById('table'));
    startApp(false);
}

function replacementNumberPaginations(el) {
    let liPaginations = document.getElementById('ulNumberPaginations').getElementsByTagName("li");

    for (let i = 0; i < liPaginations.length; i++) {
        if (liPaginations[i].id) {
            liPaginations[i].setAttribute('id', '');
        }
    }

    el.id = 'pagActive';
}

startApp();