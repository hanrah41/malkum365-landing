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
   상태
========================= */

let currentMode =
'introduce';

/* =========================
   버튼
========================= */

const buttons =
document.querySelectorAll(
    '.menu-btn'
);

const newBtn =
document.querySelector(
    '[data-mode="new"]'
);

const introduceBtn =
document.querySelector(
    '[data-mode="introduce"]'
);

const customerBtn =
document.querySelector(
    '[data-mode="customer"]'
);

const reserveBtn =
document.querySelector(
    '[data-mode="reserve"]'
);

const processBtn =
document.querySelector(
    '[data-mode="process"]'
);

const doneBtn =
document.querySelector(
    '[data-mode="done"]'
);

const memoBtn =
document.querySelector(
    '[data-mode="memo"]'
);

const alarmBtn =
document.querySelector(
    '[data-mode="alarm"]'
);

/* =========================
   활성 버튼
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
   상담예정일 자동변환
========================= */

function formatReserveDate(value){

    const numbers =
    String(value || '')
    .replace(/\D/g,'');

    if(numbers.length === 10){

        const yy =
        numbers.substring(0,2);

        const mm =
        numbers.substring(2,4);

        const dd =
        numbers.substring(4,6);

        const hh =
        numbers.substring(6,8);

        const mi =
        numbers.substring(8,10);

        return `20${yy}-${mm}-${dd} ${hh}:${mi}`;
    }

    if(numbers.length === 12){

        const yyyy =
        numbers.substring(0,4);

        const mm =
        numbers.substring(4,6);

        const dd =
        numbers.substring(6,8);

        const hh =
        numbers.substring(8,10);

        const mi =
        numbers.substring(10,12);

        return `${yyyy}-${mm}-${dd} ${hh}:${mi}`;
    }

    return value;
}

/* =========================
   현재 날짜시간 생성
========================= */

function getNowDateTime(){

    const now =
    new Date();

    const yyyy =
    now.getFullYear();

    const mm =
    String(
        now.getMonth() + 1
    ).padStart(2,'0');

    const dd =
    String(
        now.getDate()
    ).padStart(2,'0');

    const hh =
    String(
        now.getHours()
    ).padStart(2,'0');

    const mi =
    String(
        now.getMinutes()
    ).padStart(2,'0');

    const ss =
    String(
        now.getSeconds()
    ).padStart(2,'0');

    return `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss}`;
}

/* =========================
   날짜 추출
========================= */

function getCreatedDate(item){

    if(item.created_at){

        return item.created_at;
    }

    if(item.created_text){

        return item.created_text;
    }

    return '';
}

/* =========================
   소개등록
========================= */

if(newBtn){

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

            created_at:
            getNowDateTime(),

            status:'신규고객',

            memo:'',

            reserve_date:'',

            consult_done:false

        }]);

        if(result.error){

            console.log(
                result.error
            );

            alert(
                '등록 실패'
            );

            return;
        }

        alert(
            '소개등록 완료'
        );

        introduceBtn.click();
    };
}

/* =========================
   소개명단
   종료된 고객은 제외
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

    .or(
        'consult_done.is.null,consult_done.eq.false'
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
};

/* =========================
   고객명단
   종료된 소개고객 + notes 고객
========================= */

customerBtn.onclick =
async function(){

    currentMode =
    'customer';

    setActiveButton(
        customerBtn
    );

    const crmResult =
    await supabaseClient

    .from('crm_customers')

    .select('*')

    .eq(
        'consult_done',
        true
    )

    .order(
        'id',
        {
            ascending:false
        }
    );

    const notesResult =
    await supabaseClient

    .from('notes')

    .select('*')

    .order(
        'id',
        {
            ascending:false
        }
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

    renderCRMTable(
        merged
    );
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
   상담예정 로드
   종료된 고객은 제외
========================= */

async function loadReserveList(){

    const crmResult =
    await supabaseClient

    .from('crm_customers')

    .select('*')

    .or(
        'consult_done.is.null,consult_done.eq.false'
    )

    .not(
        'reserve_date',
        'is',
        null
    )

    .neq(
        'reserve_date',
        ''
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
async function(){

    currentMode =
    'done';

    setActiveButton(
        doneBtn
    );

    const result =
    await supabaseClient

    .from('crm_customers')

    .select('*')

    .eq(
        'consult_done',
        true
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
};

/* =========================
   고객메모
========================= */

if(memoBtn){

    memoBtn.onclick =
    function(){

        currentMode =
        'memo';

        setActiveButton(
            memoBtn
        );

        loadCRMWithMemo();
    };
}

/* =========================
   알람설정
========================= */

if(alarmBtn){

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
}

/* =========================
   상태별 로드
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
   메모 로드
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

    .neq(
        'memo',
        ''
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
   종료 처리
   상담예정 / 소개명단에서 사라짐
   고객명단에만 표시됨
========================= */

async function completeConsult(id){

    const result =
    await supabaseClient

    .from('crm_customers')

    .update({

        consult_done:true

    })

    .eq(
        'id',
        id
    );

    if(result.error){

        console.log(
            result.error
        );

        alert(
            '종료 처리 실패'
        );

        return;
    }

    loadReserveList();
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

        const tableName =
        item.source_table || 'crm_customers';

        const createdDate =
        getCreatedDate(item);

        const hasReserve =
        item.reserve_date &&
        item.reserve_date !== '';

        const tr =
        document.createElement(
            'tr'
        );

        tr.innerHTML = `

            <td>
                ${item.id || ''}
            </td>

            <td class="editable-cell"
                data-id="${item.id}"
                data-table="${tableName}"
                data-field="name">

                ${item.name || ''}

            </td>

            <td class="editable-cell"
                data-id="${item.id}"
                data-table="${tableName}"
                data-field="phone">

                ${formatPhoneNumber(
                    item.phone || ''
                )}

            </td>

            <td>

                ${createdDate}

            </td>

            <td class="editable-cell"
                data-id="${item.id}"
                data-table="${tableName}"
                data-field="status">

                ${item.status || ''}

            </td>

            <td class="editable-reserve"
                data-id="${item.id}"
                data-table="${tableName}">

                ${item.reserve_date || ''}

            </td>

            <td>

                ${
                    currentMode === 'reserve'
                    &&
                    hasReserve
                    &&
                    tableName === 'crm_customers'

                    ?

                    `<button
                        class="finish-btn"
                        data-id="${item.id}"
                    >
                        종료
                    </button>`

                    :

                    ''
                }

            </td>

        `;

        body.appendChild(
            tr
        );
    });

    bindEditableCells();
    bindReserveDateEditor();
    bindFinishButtons();
}

/* =========================
   일반 셀 수정
========================= */

function bindEditableCells(){

    const cells =
    document.querySelectorAll(
        '.editable-cell'
    );

    cells.forEach(cell=>{

        cell.onclick =
        async function(){

            const id =
            this.dataset.id;

            const table =
            this.dataset.table;

            const field =
            this.dataset.field;

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

            const result =
            await supabaseClient

            .from(table)

            .update({

                [field]:value

            })

            .eq(
                'id',
                id
            );

            if(result.error){

                console.log(
                    result.error
                );

                alert(
                    '수정 실패'
                );

                return;
            }

            refreshCurrentMode();
        };
    });
}

/* =========================
   종료 버튼
========================= */

function bindFinishButtons(){

    const finishButtons =
    document.querySelectorAll(
        '.finish-btn'
    );

    finishButtons.forEach(btn=>{

        btn.onclick =
        function(){

            completeConsult(
                this.dataset.id
            );
        };
    });
}

/* =========================
   상담예정일 수정
========================= */

function bindReserveDateEditor(){

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

            let value =
            prompt(
`상담예정일 입력

예:
2505121030
또는
202505121030

↓

2025-05-12 10:30 자동변환`,
                current
            );

            if(value === null)
            return;

            value =
            formatReserveDate(
                value
            );

            const result =
            await supabaseClient

            .from(table)

            .update({

                reserve_date:value

            })

            .eq(
                'id',
                id
            );

            if(result.error){

                console.log(
                    result.error
                );

                alert(
                    '상담예정일 수정 실패'
                );

                return;
            }

            refreshCurrentMode();
        };
    });
}

/* =========================
   새로고침
========================= */

function refreshCurrentMode(){

    if(currentMode === 'reserve'){

        loadReserveList();
        return;
    }

    if(currentMode === 'customer'){

        customerBtn.click();
        return;
    }

    if(currentMode === 'done'){

        doneBtn.click();
        return;
    }

    if(currentMode === 'process'){

        loadCRMByStatus(
            '진행중'
        );

        return;
    }

    if(currentMode === 'memo'){

        loadCRMWithMemo();
        return;
    }

    introduceBtn.click();
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

        if(currentMode === 'customer' || currentMode === 'reserve'){

            refreshCurrentMode();
        }
    }
)

.subscribe();

/* =========================
   시작
========================= */

introduceBtn.click();
