/* =========================
   Supabase 설정
========================= */

const supabaseUrl =
'https://pziyabogqefxzvinwarg.supabase.co';

const supabaseKey =
'sb_publishable_VrVP0buVQ3kCBiQm88Jr5g_q61_DoK8';

const supabaseClient =
window.supabase.createClient(
    supabaseUrl,
    supabaseKey
);

/* =========================
   현재 상태
========================= */

let currentMode = 'new';

let currentEditId = null;
let currentEditField = null;
let currentEditTable = 'crm_customers';

/* =========================
   버튼
========================= */

const buttons =
document.querySelectorAll('.menu-btn');

const newBtn =
document.querySelector('[data-mode="new"]');

const introduceBtn =
document.querySelector('[data-mode="introduce"]');

const customerBtn =
document.querySelector('[data-mode="customer"]');

const reserveBtn =
document.querySelector('[data-mode="reserve"]');

const processBtn =
document.querySelector('[data-mode="process"]');

const doneBtn =
document.querySelector('[data-mode="done"]');

const memoBtn =
document.querySelector('[data-mode="memo"]');

const alarmBtn =
document.querySelector('[data-mode="alarm"]');

/* =========================
   전화번호 자동 하이픈
========================= */

function formatPhoneNumber(value){

    const numbers =
    String(value || '')
    .replace(/\D/g,'');

    if(numbers.length === 11){

        return numbers.replace(
            /(\d{3})(\d{4})(\d{4})/,
            '$1-$2-$3'
        );
    }

    if(numbers.length === 10){

        return numbers.replace(
            /(\d{3})(\d{3})(\d{4})/,
            '$1-$2-$3'
        );
    }

    return value;
}

/* =========================
   공통 버튼 템플릿
========================= */

function setActiveButton(target){

    buttons.forEach(btn=>{

        btn.classList.remove(
            'active'
        );
    });

    target.classList.add(
        'active'
    );
}

/* =========================
   created_at 추출
========================= */

function getCreatedDate(item){

    if(item.created_text){

        return item.created_text;
    }

    if(item.created_at){

        return item.created_at;
    }

    if(item.created_time){

        return item.created_time;
    }

    if(item.inserted_at){

        return item.inserted_at;
    }

    if(item.reg_date){

        return item.reg_date;
    }

    if(item.date){

        return item.date;
    }

    if(item.createdAt){

        return item.createdAt;
    }

    return '';
}

/* =========================
   대형 편집창 열기
========================= */

function openBigEditor(
    table,
    id,
    field,
    value
){

    currentEditTable =
    table;

    currentEditId =
    id;

    currentEditField =
    field;

    const modal =
    document.getElementById(
        'editorModal'
    );

    const textarea =
    document.getElementById(
        'editorTextarea'
    );

    const title =
    document.getElementById(
        'editorTitle'
    );

    if(field === 'status'){

        title.innerText =
        '상태 편집';
    }

    if(field === 'memo'){

        title.innerText =
        '메모 편집';
    }

    textarea.value =
    value || '';

    modal.style.display =
    'flex';

    textarea.focus();
}

/* =========================
   대형 편집창 저장
========================= */

document
.getElementById(
    'saveEditorBtn'
)
.onclick =
async function(){

    const value =
    document
    .getElementById(
        'editorTextarea'
    )
    .value;

    if(
        currentEditId === null ||
        currentEditField === null
    ){

        return;
    }

    const result =
    await supabaseClient

    .from(currentEditTable)

    .update({

        [currentEditField]:
        value

    })

    .eq(
        'id',
        currentEditId
    );

    if(result.error){

        alert(
            'DB 저장 실패'
        );

        return;
    }

    document
    .getElementById(
        'editorModal'
    )
    .style.display =
    'none';

    refreshCurrentMode();
};

/* =========================
   대형 편집창 닫기
========================= */

document
.getElementById(
    'closeEditorBtn'
)
.onclick =
function(){

    document
    .getElementById(
        'editorModal'
    )
    .style.display =
    'none';
};

/* =========================
   소개등록
========================= */

newBtn.onclick =
async function(){

    currentMode =
    'new';

    setActiveButton(
        newBtn
    );

    const name =
    prompt(
        '성명 입력'
    );

    if(!name) return;

    const result =
    await supabaseClient

    .from('crm_customers')

    .insert([{

        name:name,

        phone:'',

        created_at:'',

        status:'신규고객',

        memo:'',
        reserve_date:''

    }]);

    if(result.error){

        alert(
            'DB 저장 실패'
        );

        return;
    }

    loadCRM();
};

/* =========================
   소개명단
========================= */

introduceBtn.onclick =
async function(){

    currentMode =
    'introduce';

    setActiveButton(
        introduceBtn
    );

    const result =
    await supabaseClient

    .from('crm_customers')

    .select('*')

    .order(
        'id',
        {
            ascending:false
        }
    );

    renderCRMTable(
        result.data || []
    );
};

/* =========================
   고객명단
========================= */

customerBtn.onclick =
function(){

    currentMode =
    'customer';

    setActiveButton(
        customerBtn
    );

    loadNotes();
};

/* =========================
   상담예정
========================= */

reserveBtn.onclick =
function(){

    currentMode =
    'reserve';

    setActiveButton(
        reserveBtn
    );

    loadReserveList();
};

/* =========================
   상담예정 로드
========================= */

async function loadReserveList(){

    const crmResult =
    await supabaseClient

    .from('crm_customers')

    .select('*')

    .not(
        'reserve_date',
        'is',
        null
    )

    .neq(
        'reserve_date',
        ''
    )

    .neq(
        'status',
        '완료'
    );

    const notesResult =
    await supabaseClient

    .from('notes')

    .select('*')

    .not(
        'reserve_date',
        'is',
        null
    )

    .neq(
        'reserve_date',
        ''
    );

    const crmData =
    (crmResult.data || []).map(item=>({

        ...item,

        source_table:
        'crm_customers'

    }));

    const notesData =
    (notesResult.data || []).map(item=>({

        ...item,

        source_table:
        'notes'

    }));

    const merged = [

        ...crmData,
        ...notesData

    ];

    merged.sort((a,b)=>{

        return new Date(a.reserve_date)
        -
        new Date(b.reserve_date);
    });

    renderCRMTable(
        merged
    );
}

/* =========================
   진행중
========================= */

processBtn.onclick =
function(){

    currentMode =
    'process';

    setActiveButton(
        processBtn
    );

    loadCRMByStatus(
        '진행중'
    );
};

/* =========================
   완료
========================= */

doneBtn.onclick =
function(){

    currentMode =
    'done';

    setActiveButton(
        doneBtn
    );

    loadCRMByStatus(
        '완료'
    );
};

/* =========================
   고객메모
========================= */

memoBtn.onclick =
function(){

    currentMode =
    'memo';

    setActiveButton(
        memoBtn
    );

    loadCRMWithMemo();
};

/* =========================
   알람설정
========================= */

alarmBtn.onclick =
function(){

    alert(
        '알람 시스템 준비중'
    );
};

/* =========================
   notes 로드
========================= */

async function loadNotes(){

    const result =
    await supabaseClient

    .from('notes')

    .select('*')

    .order(
        'id',
        {
            ascending:false
        }
    );

    const data =
    (result.data || []).map(item=>({

        ...item,

        source_table:
        'notes'

    }));

    renderCRMTable(
        data
    );
}

/* =========================
   CRM 전체 로드
========================= */

async function loadCRM(){

    const result =
    await supabaseClient

    .from('crm_customers')

    .select('*')

    .order(
        'id',
        {
            ascending:false
        }
    );

    renderCRMTable(
        result.data || []
    );
}

/* =========================
   CRM 상태별 로드
========================= */

async function loadCRMByStatus(status){

    const result =
    await supabaseClient

    .from('crm_customers')

    .select('*')

    .eq(
        'status',
        status
    )

    .order(
        'id',
        {
            ascending:false
        }
    );

    renderCRMTable(
        result.data || []
    );
}

/* =========================
   CRM 메모 있는 고객
========================= */

async function loadCRMWithMemo(){

    const result =
    await supabaseClient

    .from('crm_customers')

    .select('*')

    .not(
        'memo',
        'is',
        null
    )

    .order(
        'id',
        {
            ascending:false
        }
    );

    renderCRMTable(
        result.data || []
    );
}

/* =========================
   완료 체크 이벤트
========================= */

function bindDoneChecks(){

    const checks =
    document.querySelectorAll(
        '.done-check'
    );

    checks.forEach(check=>{

        check.onchange =
        async function(){

            const id =
            this.dataset.id;

            const table =
            this.dataset.table;

            if(table !== 'crm_customers'){

                return;
            }

            if(this.checked){

                await supabaseClient

                .from('crm_customers')

                .update({

                    status:'완료'

                })

                .eq(
                    'id',
                    id
                );

            }else{

                await supabaseClient

                .from('crm_customers')

                .update({

                    status:'신규고객'

                })

                .eq(
                    'id',
                    id
                );
            }

            refreshCurrentMode();
        };
    });
}

/* =========================
   CRM 출력
========================= */

function renderCRMTable(data){

    const body =
    document.getElementById(
        'crmBody'
    );

    body.innerHTML =
    '';

    data.forEach(item=>{

        const checked =
        item.status === '완료'
        ? 'checked'
        : '';

        const tableName =
        item.source_table || 'crm_customers';

        const createdDate =
        getCreatedDate(item);

        const tr =
        document.createElement(
            'tr'
        );

        tr.innerHTML = `

            <td>${item.id || ''}</td>

            <td class="editable"
                data-id="${item.id}"
                data-field="name"
                data-table="${tableName}">

                ${item.name || ''}

            </td>

            <td class="editable"
                data-id="${item.id}"
                data-field="phone"
                data-table="${tableName}">

                ${formatPhoneNumber(item.phone || '')}

            </td>

            <td class="editable-date"
                data-id="${item.id}"
                data-table="${tableName}">

                ${createdDate}

            </td>

            <td class="editable-big"
                data-id="${item.id}"
                data-field="status"
                data-table="${tableName}">

                ${item.status || ''}

            </td>

            <td class="editable-reserve"
                data-id="${item.id}"
                data-table="${tableName}">

                ${item.reserve_date || ''}

            </td>

            <td>

                ${
                    tableName === 'crm_customers'
                    ?

                    `<input
                        type="checkbox"
                        class="done-check"
                        data-id="${item.id}"
                        data-table="${tableName}"
                        ${checked}
                    >`

                    :

                    ''
                }

            </td>

        `;

        body.appendChild(
            tr
        );
    });

    bindCellEvents();
    bindDoneChecks();
}

/* =========================
   셀 이벤트
========================= */

function bindCellEvents(){

    const normalCells =
    document.querySelectorAll(
        '.editable'
    );

    normalCells.forEach(cell=>{

        cell.onclick =
        async function(){

            const id =
            this.dataset.id;

            const field =
            this.dataset.field;

            const table =
            this.dataset.table;

            const current =
            this.innerText.trim();

            let value =
            prompt(
                `${field} 입력`,
                current
            );

            if(value === null)
            return;

            if(field === 'phone'){

                value =
                formatPhoneNumber(
                    value
                );
            }

            await supabaseClient

            .from(table)

            .update({

                [field]:value

            })

            .eq(
                'id',
                id
            );

            refreshCurrentMode();
        };
    });

    const dateCells =
    document.querySelectorAll(
        '.editable-date'
    );

    dateCells.forEach(cell=>{

        cell.onclick =
        async function(){

            const id =
            this.dataset.id;

            const table =
            this.dataset.table;

            const current =
            this.innerText.trim();

            const value =
            prompt(
                '상담 및 신청일 입력',
                current
            );

            if(value === null)
            return;

            await supabaseClient

            .from(table)

            .update({

                created_text:value

            })

            .eq(
                'id',
                id
            );

            refreshCurrentMode();
        };
    });

    const reserveCells =
    document.querySelectorAll(
        '.editable-reserve'
    );

    reserveCells.forEach(cell=>{

        cell.onclick =
        async function(){

            const id =
            this.dataset.id;

            const table =
            this.dataset.table;

            const current =
            this.innerText.trim();

            const value =
            prompt(
                '상담예정일 입력',
                current
            );

            if(value === null)
            return;

            await supabaseClient

            .from(table)

            .update({

                reserve_date:value

            })

            .eq(
                'id',
                id
            );

            refreshCurrentMode();
        };
    });

    const bigCells =
    document.querySelectorAll(
        '.editable-big'
    );

    bigCells.forEach(cell=>{

        cell.onclick =
        function(){

            const id =
            this.dataset.id;

            const field =
            this.dataset.field;

            const table =
            this.dataset.table;

            const current =
            this.innerText.trim();

            openBigEditor(
                table,
                id,
                field,
                current
            );
        };
    });
}

/* =========================
   현재 모드 새로고침
========================= */

function refreshCurrentMode(){

    if(currentMode === 'introduce'){

        introduceBtn.click();
        return;
    }

    if(currentMode === 'customer'){

        loadNotes();
        return;
    }

    if(currentMode === 'reserve'){

        loadReserveList();
        return;
    }

    if(currentMode === 'process'){

        loadCRMByStatus(
            '진행중'
        );

        return;
    }

    if(currentMode === 'done'){

        loadCRMByStatus(
            '완료'
        );

        return;
    }

    if(currentMode === 'memo'){

        loadCRMWithMemo();
        return;
    }

    loadCRM();
}

/* =========================
   실시간
========================= */

supabaseClient

.channel('realtime-crm')

.on(

    'postgres_changes',

    {
        event:'*',
        schema:'public',
        table:'crm_customers'
    },

    ()=>{

        refreshCurrentMode();
    }
)

.subscribe();

supabaseClient

.channel('realtime-notes')

.on(

    'postgres_changes',

    {
        event:'*',
        schema:'public',
        table:'notes'
    },

    ()=>{

        refreshCurrentMode();
    }
)

.subscribe();

/* =========================
   시작
========================= */

loadCRM();
