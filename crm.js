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
   날짜 추출
========================= */

function getCreatedDate(item){

    if(item.created_text){

        return item.created_text;
    }

    if(item.created_at){

        return item.created_at;
    }

    return '';
}

/* =========================
   소개등록 복구
========================= */

if(newBtn){

    newBtn.onclick =
    async function(){

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

            reserve_date:'',

            consult_done:false

        }]);

        if(result.error){

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
    );

    const notesResult =
    await supabaseClient

    .from('notes')

    .select('*');

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
========================= */

async function loadReserveList(){

    const crmResult =
    await supabaseClient

    .from('crm_customers')

    .select('*')

    .eq(
        'consult_done',
        false
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
   종료 처리
========================= */

async function completeConsult(id){

    await supabaseClient

    .from('crm_customers')

    .update({

        consult_done:true

    })

    .eq(
        'id',
        id
    );

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

            <td>
                ${item.name || ''}
            </td>

            <td>
                ${formatPhoneNumber(
                    item.phone || ''
                )}
            </td>

            <td>
                ${createdDate}
            </td>

            <td>
                ${item.status || ''}
            </td>

            <td class="editable-reserve"
                data-id="${item.id}"
                data-table="${tableName}">

                ${item.reserve_date || ''}

            </td>

            <td>

                ${
                    hasReserve &&
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

    bindReserveDateEditor();
    bindFinishButtons();
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

/* =========================
   시작
========================= */

introduceBtn.click();
