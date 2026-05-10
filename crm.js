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

const newBtn      = document.querySelector('[data-mode="new"]');
const customerBtn = document.querySelector('[data-mode="customer"]');
const reserveBtn  = document.querySelector('[data-mode="reserve"]');
const processBtn  = document.querySelector('[data-mode="process"]');
const doneBtn     = document.querySelector('[data-mode="done"]');
const memoBtn     = document.querySelector('[data-mode="memo"]');
const alarmBtn    = document.querySelector('[data-mode="alarm"]');

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
    )

    .select();

    if(result.error){

        console.error(
            result.error
        );

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

    currentEditId =
    null;

    currentEditField =
    null;

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

    currentEditId =
    null;

    currentEditField =
    null;
};

/* =========================
   신규등록
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

        status:'',

        memo:'',
        reserve_date:''

    }])

    .select();

    if(result.error){

        console.error(
            result.error
        );

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
function(){

    currentMode =
    'customer';

    setActiveButton(
        customerBtn
    );

    loadNotes();
};

/* =========================
   소개등록 / 상담예정
========================= */

reserveBtn.onclick =
async function(){

    currentMode =
    'reserve';

    setActiveButton(
        reserveBtn
    );

    const result =
    await supabaseClient

    .from('notes')

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

    renderNotesTable(
        result.data
    );
};

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
                ${item.created_text || ''}
            </td>

            <td class="editable-big-note"
                data-id="${item.id}"
                data-field="status">

                ${item.status || '신규고객'}

            </td>

            <td class="editable-reserve"
                data-id="${item.id}">

                ${item.reserve_date || ''}

            </td>

        `;

        body.appendChild(
            tr
        );
    });

    bindNoteBigEditor();
    bindReserveDateEditor();
}

/* =========================
   notes 상태 편집창
========================= */

function bindNoteBigEditor(){

    const cells =
    document.querySelectorAll(
        '.editable-big-note'
    );

    cells.forEach(cell=>{

        cell.onclick =
        function(){

            const id =
            this.dataset.id;

            const field =
            this.dataset.field;

            const current =
            this.innerText.trim();

            openBigEditor(
                'notes',
                id,
                field,
                current
            );
        };
    });
}

/* =========================
   상담예정일 입력 엔진
========================= */

function bindReserveDateEditor(){

    const cells =
    document.querySelectorAll(
        '.editable-reserve'
    );

    cells.forEach(cell=>{

        cell.onclick =
        async function(){

            const id =
            this.dataset.id;

            const current =
            this.innerText.trim();

            const raw =
            prompt(

`상담예정일 입력

숫자만 입력

예:
2506121500

↓

2025-06-12 15:00 자동변환

삭제하려면 입력창을 비우세요.`,

                current
                    .replaceAll('-','')
                    .replaceAll(':','')
                    .replaceAll(' ','')
                    .replace('20','')

            );

            if(raw === null){

                return;
            }

            let tableName =
            'notes';

            if(
                currentMode === 'new' ||
                currentMode === 'process' ||
                currentMode === 'done'
            ){

                tableName =
                'crm_customers';
            }

            if(raw.trim() === ''){

                const clearResult =
                await supabaseClient

                .from(tableName)

                .update({

                    reserve_date:null

                })

                .eq(
                    'id',
                    id
                )

                .select();

                if(clearResult.error){

                    console.error(
                        clearResult.error
                    );

                    alert(
                        '상담예정일 삭제 실패'
                    );

                    return;
                }

                refreshCurrentMode();

                return;
            }

            const value =
            raw.trim();

            if(value.length !== 10){

                alert(
                    '10자리 숫자 입력\n\n예:\n2506121500'
                );

                return;
            }

            const yy =
            value.substring(0,2);

            const mm =
            value.substring(2,4);

            const dd =
            value.substring(4,6);

            const hh =
            value.substring(6,8);

            const mi =
            value.substring(8,10);

            const formatted =
`20${yy}-${mm}-${dd} ${hh}:${mi}`;

            const result =
            await supabaseClient

            .from(tableName)

            .update({

                reserve_date:
                formatted

            })

            .eq(
                'id',
                id
            )

            .select();

            if(result.error){

                console.error(
                    result.error
                );

                alert(
                    '상담예정일 저장 실패'
                );

                return;
            }

            refreshCurrentMode();
        };
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

                ${item.created_at || ''}

            </td>

            <td class="editable-big"
                data-id="${item.id}"
                data-field="status">

                ${item.status || ''}

            </td>

            <td class="editable-reserve"
                data-id="${item.id}">

                ${item.reserve_date || ''}

            </td>

        `;

        body.appendChild(
            tr
        );
    });

    bindCellEvents();
    bindReserveDateEditor();
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

            if(result.error){

                alert(
                    'DB 저장 실패'
                );

                return;
            }

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

            const current =
            this.innerText.trim();

            const raw =
            prompt(

`상담 및 신청일 입력

숫자만 입력

예:
2505121100

↓

2025-05-12 11:00 자동변환`,

                current
                    .replaceAll('-','')
                    .replaceAll(':','')
                    .replaceAll(' ','')
                    .replace('20','')

            );

            if(raw === null)
            return;

            if(raw.trim() === ''){

                const clearResult =
                await supabaseClient

                .from('crm_customers')

                .update({

                    created_at:null

                })

                .eq(
                    'id',
                    id
                )

                .select();

                if(clearResult.error){

                    alert(
                        '날짜 삭제 실패'
                    );

                    return;
                }

                refreshCurrentMode();

                return;
            }

            const value =
            raw.trim();

            if(value.length !== 10){

                alert(
                    '10자리 숫자 입력\n\n예:\n2505121100'
                );

                return;
            }

            const yy =
            value.substring(0,2);

            const mm =
            value.substring(2,4);

            const dd =
            value.substring(4,6);

            const hh =
            value.substring(6,8);

            const mi =
            value.substring(8,10);

            const formatted =
`20${yy}-${mm}-${dd} ${hh}:${mi}`;

            const result =
            await supabaseClient

            .from('crm_customers')

            .update({

                created_at:
                formatted

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

            const current =
            this.innerText.trim();

            openBigEditor(
                'crm_customers',
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

    if(currentMode === 'customer'){

        loadNotes();

        return;
    }

    if(currentMode === 'reserve'){

        reserveBtn.click();

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

        if(
            currentMode === 'customer' ||
            currentMode === 'reserve'
        ){

            refreshCurrentMode();
        }
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

        if(currentMode !== 'customer'){

            refreshCurrentMode();
        }
    }
)

.subscribe();

/* =========================
   시작
========================= */

loadCRM();
