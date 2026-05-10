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
const reserveBtn  = buttons[1];
const processBtn  = buttons[2];
const doneBtn     = buttons[3];
const memoBtn     = buttons[4];
const alarmBtn    = buttons[5];

/* =========================
   활성 버튼
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

    activeButton(
        newBtn
    );

    try{

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

            created_at:null,

            status:'',

            memo:''

        }])

        .select();

        console.log(result);

        if(result.error){

            console.error(
                result.error
            );

            alert(
                'DB 저장 실패'
            );

            return;
        }

        loadAll();

    }catch(err){

        console.error(err);

        alert(
            '오류 발생'
        );
    }
};

/* =========================
   날짜 포맷
========================= */

function formatDate(value){

    if(
        !value ||
        value === 'null'
    ){

        return '';
    }

    if(
        value.includes('T')
    ){

        return '';
    }

    return value;
}

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

        const tr =
        document.createElement('tr');

        tr.innerHTML = `

            <td>${item.id || ''}</td>

            <td class="editable"
                data-id="${item.id}"
                data-field="name">

                ${item.name || ''}

            </td>

            <td class="editable"
                data-id="${item.id}"
                data-field="phone">

                ${item.phone || ''}

            </td>

            <td class="editable-date"
                data-id="${item.id}"
                data-field="created_at">

                ${formatDate(item.created_at)}

            </td>

            <td class="editable"
                data-id="${item.id}"
                data-field="status">

                ${item.status || ''}

            </td>

            <td class="editable"
                data-id="${item.id}"
                data-field="memo">

                ${item.memo || ''}

            </td>

        `;

        body.appendChild(tr);
    });

    bindEditable();
}

/* =========================
   셀 수정
========================= */

function bindEditable(){

    /* =====================
       일반 입력
    ===================== */

    const editableCells =
    document.querySelectorAll(
        '.editable'
    );

    editableCells.forEach(cell=>{

        cell.onclick =
        async function(){

            const id =
            this.dataset.id;

            const field =
            this.dataset.field;

            const current =
            this.innerText.trim();

            const value =
            prompt(

                `${field} 입력`,

                current

            );

            if(value === null)
            return;

            const result =
            await supabaseClient

            .from('crm_customers')

            .update({

                [field]:value

            })

            .eq(
                'id',
                id
            )

            .select();

            console.log(result);

            if(result.error){

                console.error(
                    result.error
                );

                alert(
                    'DB 저장 실패'
                );

                return;
            }

            loadAll();
        };
    });

    /* =====================
       상담시간 입력
    ===================== */

    const dateCells =
    document.querySelectorAll(
        '.editable-date'
    );

    dateCells.forEach(cell=>{

        cell.onclick =
        async function(){

            const id =
            this.dataset.id;

            const current =
            this.innerText.trim();

            const value =
            prompt(

`상담일 입력

예:
2025-05-07 15:30`,

                current

            );

            if(value === null)
            return;

            const result =
            await supabaseClient

            .from('crm_customers')

            .update({

                created_at:value

            })

            .eq(
                'id',
                id
            )

            .select();

            console.log(result);

            if(result.error){

                console.error(
                    result.error
                );

                alert(
                    'DB 저장 실패'
                );

                return;
            }

            loadAll();
        };
    });
}

/* =========================
   전체 로드
========================= */

async function loadAll(){

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

    console.log(result);

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
async function(){

    activeButton(
        reserveBtn
    );

    const result =
    await supabaseClient

    .from('crm_customers')

    .select('*')

    .eq(
        'status',
        '상담예정'
    )

    .order(
        'id',
        {
            ascending:false
        }
    );

    renderTable(
        result.data
    );
};

/* =========================
   진행중
========================= */

processBtn.onclick =
async function(){

    activeButton(
        processBtn
    );

    const result =
    await supabaseClient

    .from('crm_customers')

    .select('*')

    .eq(
        'status',
        '진행중'
    )

    .order(
        'id',
        {
            ascending:false
        }
    );

    renderTable(
        result.data
    );
};

/* =========================
   완료
========================= */

doneBtn.onclick =
async function(){

    activeButton(
        doneBtn
    );

    const result =
    await supabaseClient

    .from('crm_customers')

    .select('*')

    .eq(
        'status',
        '완료'
    )

    .order(
        'id',
        {
            ascending:false
        }
    );

    renderTable(
        result.data
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

    renderTable(
        result.data
    );
};

/* =========================
   알람
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
