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
   대형 편집창 상태
========================= */

let currentEditId = null;
let currentEditField = null;

/* =========================
   버튼
========================= */

const buttons =
document.querySelectorAll('.menu-btn');

const newBtn      = buttons[0];
const customerBtn = buttons[1];
const reserveBtn  = buttons[2];
const processBtn  = buttons[3];
const doneBtn     = buttons[4];
const memoBtn     = buttons[5];
const alarmBtn    = buttons[6];

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

        status:'',

        memo:''

    }])

    .select();

    console.log(result);

    if(result.error){

        alert(
            'DB 저장 실패'
        );

        return;
    }

    loadCRM();
};

/* =========================
   고객명단
========================= */

customerBtn.onclick =
async function(){

    activeButton(
        customerBtn
    );

    loadNotes();
};

/* =========================
   notes 불러오기
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

    console.log(
        'notes:',
        result
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
   notes 테이블 출력
========================= */

function renderNotesTable(data){

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

            <td>

                ${item.name || ''}

            </td>

            <td>

                ${item.phone || ''}

            </td>

            <td>

                ${item.created_text || ''}

            </td>

            <td>

                신규고객

            </td>

            <td>

                랜딩유입

            </td>

        `;

        body.appendChild(tr);
    });
}

/* =========================
   날짜 포맷
========================= */

function formatDate(value){

    if(!value) return '';

    if(
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
   CRM 테이블 출력
========================= */

function renderCRMTable(data){

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
                data-id="${item.id}">

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

            /* =====================
               상태 / 메모
            ===================== */

            if(
                field === 'status' ||
                field === 'memo'
            ){

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

                textarea.value =
                current;

                modal.style.display =
                'flex';

                return;
            }

            /* =====================
               일반 입력
            ===================== */

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

            if(result.error){

                alert(
                    'DB 저장 실패'
                );

                return;
            }

            loadCRM();
        };
    });

    /* =====================
       상담일 입력
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

            if(result.error){

                alert(
                    'DB 저장 실패'
                );

                return;
            }

            loadCRM();
        };
    });
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

    const result =

    await supabaseClient

    .from('crm_customers')

    .update({

        [currentEditField]:
        value

    })

    .eq(
        'id',
        currentEditId
    )

    .select();

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

    loadCRM();
};

/* =========================
   닫기
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
   CRM 로드
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

        if(
            customerBtn.classList.contains(
                'active'
            )
        ){

            loadNotes();
        }
    }
)

.subscribe();

/* =========================
   실시간 CRM
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

        if(
            newBtn.classList.contains(
                'active'
            )
        ){

            loadCRM();
        }
    }
)

.subscribe();

/* =========================
   시작
========================= */

loadCRM();
