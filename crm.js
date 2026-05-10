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

const newBtn       = document.querySelector('[data-mode="new"]');
const introduceBtn = document.querySelector('[data-mode="introduce"]');
const customerBtn  = document.querySelector('[data-mode="customer"]');
const reserveBtn   = document.querySelector('[data-mode="reserve"]');
const processBtn   = document.querySelector('[data-mode="process"]');
const doneBtn      = document.querySelector('[data-mode="done"]');
const memoBtn      = document.querySelector('[data-mode="memo"]');
const alarmBtn     = document.querySelector('[data-mode="alarm"]');

/* =========================
   버튼 활성화
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
   소개등록
========================= */

newBtn.onclick =
function(){

    currentMode =
    'new';

    setActiveButton(
        newBtn
    );

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

    .not(
        'reserve_date',
        'is',
        null
    )

    .order(
        'reserve_date',
        {
            ascending:true
        }
    );

    if(result.error){

        console.error(
            result.error
        );

        return;
    }

    renderCRMTable(
        result.data
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
async function(){

    currentMode =
    'reserve';

    setActiveButton(
        reserveBtn
    );

    loadReserveList();
};

/* =========================
   상담예정 통합 로드
========================= */

async function loadReserveList(){

    const notesResult =
    await supabaseClient

    .from('notes')

    .select('*')

    .not(
        'reserve_date',
        'is',
        null
    );

    const crmResult =
    await supabaseClient

    .from('crm_customers')

    .select('*')

    .not(
        'reserve_date',
        'is',
        null
    );

    if(notesResult.error){

        console.error(
            notesResult.error
        );

        return;
    }

    if(crmResult.error){

        console.error(
            crmResult.error
        );

        return;
    }

    const merged = [

        ...notesResult.data,

        ...crmResult.data

    ];

    merged.sort((a,b)=>{

        return new Date(a.reserve_date)
        -
        new Date(b.reserve_date);
    });

    renderNotesTable(
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

    currentMode =
    'alarm';

    setActiveButton(
        alarmBtn
    );

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

    if(result.error){

        console.error(
            result.error
        );

        return;
    }

    renderNotesTable(
        result.data
    );
}

/* =========================
   notes 출력
========================= */

function renderNotesTable(data){

    const body =
    document.getElementById(
        'crmBody'
    );

    body.innerHTML =
    '';

    data.forEach(item=>{

        const tr =
        document.createElement(
            'tr'
        );

        tr.innerHTML = `

            <td>${item.id || ''}</td>

            <td>
                ${item.name || ''}
            </td>

            <td>
                ${item.phone || ''}
            </td>

            <td>
                ${item.created_text || item.created_at || ''}
            </td>

            <td>
                ${item.status || ''}
            </td>

            <td>
                ${item.reserve_date || ''}
            </td>

        `;

        body.appendChild(
            tr
        );
    });
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

    if(result.error){

        console.error(
            result.error
        );

        return;
    }

    renderCRMTable(
        result.data
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

    if(result.error){

        console.error(
            result.error
        );

        return;
    }

    renderCRMTable(
        result.data
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

    if(result.error){

        console.error(
            result.error
        );

        return;
    }

    renderCRMTable(
        result.data
    );
}

/* =========================
   CRM 테이블 출력
========================= */

function renderCRMTable(data){

    const body =
    document.getElementById(
        'crmBody'
    );

    body.innerHTML =
    '';

    data.forEach(item=>{

        const tr =
        document.createElement(
            'tr'
        );

        tr.innerHTML = `

            <td>${item.id || ''}</td>

            <td>${item.name || ''}</td>

            <td>${item.phone || ''}</td>

            <td>${item.created_at || ''}</td>

            <td>${item.status || ''}</td>

            <td>${item.reserve_date || ''}</td>

        `;

        body.appendChild(
            tr
        );
    });
}

/* =========================
   현재 모드 새로고침
========================= */

function refreshCurrentMode(){

    if(currentMode === 'customer'){

        loadNotes();

        return;
    }

    if(currentMode === 'introduce'){

        introduceBtn.click();

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
   실시간 notes
========================= */

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
   실시간 CRM
========================= */

supabaseClient

.channel('realtime-crm-customers')

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

/* =========================
   시작
========================= */

loadCRM();
