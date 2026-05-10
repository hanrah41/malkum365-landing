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
   버튼
========================= */

const buttons =
document.querySelectorAll('.menu-btn');

const newBtn      = buttons[0];
const freeBtn     = buttons[1];
const reserveBtn  = buttons[2];
const processBtn  = buttons[3];
const doneBtn     = buttons[4];
const memoBtn     = buttons[5];
const alarmBtn    = buttons[6];

/* =========================
   활성 버튼 표시
========================= */

function activeButton(target){

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
   신규등록
========================= */

newBtn.onclick =
async function(){

    activeButton(newBtn);

    const name =
    prompt('고객명');

    if(!name) return;

    const phone =
    prompt('연락처');

    if(!phone) return;

    const memo =
    prompt('메모');

    const result =
    await supabaseClient

    .from('leads')

    .insert([{

        name:name,

        phone:phone,

        memo:memo,

        status:'신규등록',

        created_text:
        new Date()

        .toLocaleString()

    }])

    .select();

    console.log(result);
};

/* =========================
   무료신청
========================= */

freeBtn.onclick =
async function(){

    activeButton(freeBtn);

    const name =
    prompt('고객명');

    if(!name) return;

    const phone =
    prompt('연락처');

    if(!phone) return;

    const memo =
    prompt('메모');

    const result =
    await supabaseClient

    .from('leads')

    .insert([{

        name:name,

        phone:phone,

        memo:memo,

        status:'무료신청',

        created_text:
        new Date()

        .toLocaleString()

    }])

    .select();

    console.log(result);
};

/* =========================
   테이블 출력
========================= */

function renderTable(data){

    const body =
    document.getElementById(
        'crmBody'
    );

    body.innerHTML = '';

    data.forEach(item=>{

        let rowColor = '';

        /* =========================
           상태 색상
        ========================== */

        if(
            item.status === '상담예정'
        ){

            rowColor =
            '#F5D545';
        }

        if(
            item.status === '진행중'
        ){

            rowColor =
            '#B9D19E';
        }

        if(
            item.status === '완료'
        ){

            rowColor =
            '#D5D5D5';
        }

        const tr =
        document.createElement('tr');

        tr.style.background =
        rowColor;

        tr.innerHTML = `

            <td>${item.id || ''}</td>

            <td>${item.name || ''}</td>

            <td>${item.phone || ''}</td>

            <td>${item.created_text || ''}</td>

            <td>${item.status || ''}</td>

            <td>${item.memo || ''}</td>

        `;

        body.appendChild(tr);
    });
}

/* =========================
   전체 불러오기
========================= */

async function loadAll(){

    const result =
    await supabaseClient

    .from('leads')

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

    renderTable(
        result.data
    );
}

/* =========================
   상태별 필터
========================= */

async function loadByStatus(status){

    const result =
    await supabaseClient

    .from('leads')

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

    renderTable(
        result.data
    );
}

/* =========================
   상담예정
========================= */

reserveBtn.onclick =
function(){

    activeButton(
        reserveBtn
    );

    loadByStatus(
        '상담예정'
    );
};

/* =========================
   진행중
========================= */

processBtn.onclick =
function(){

    activeButton(
        processBtn
    );

    loadByStatus(
        '진행중'
    );
};

/* =========================
   완료
========================= */

doneBtn.onclick =
function(){

    activeButton(
        doneBtn
    );

    loadByStatus(
        '완료'
    );
};

/* =========================
   고객메모
========================= */

memoBtn.onclick =
async function(){

    activeButton(
        memoBtn
    );

    const result =
    await supabaseClient

    .from('leads')

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

    renderTable(
        result.data
    );
};

/* =========================
   알람설정
========================= */

alarmBtn.onclick =
function(){

    activeButton(
        alarmBtn
    );

    alert(
        '알람 시스템 준비중'
    );
};

/* =========================
   실시간 반영
========================= */

supabaseClient

.channel('realtime-leads')

.on(

    'postgres_changes',

    {

        event:'INSERT',

        schema:'public',

        table:'leads'
    },

    payload=>{

        console.log(
            '실시간:',
            payload
        );

        loadAll();
    }
)

.subscribe();

/* =========================
   시작
========================= */

loadAll();
