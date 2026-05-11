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

let counselTarget = {
    id:null,
    table:null
};

const MEMO_STORAGE_KEY =
'malkum365_customer_memo_text';

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

const memoBtn =
document.querySelector(
    '[data-mode="memo"]'
);

const alarmBtn =
document.querySelector(
    '[data-mode="alarm"]'
);

/* =========================
   영역
========================= */

const crmTableArea =
document.getElementById(
    'crmTableArea'
);

const memoArea =
document.getElementById(
    'memoArea'
);

const memoTextArea =
document.getElementById(
    'memoTextArea'
);

/* =========================
   상담내용 창 요소
========================= */

const counselModal =
document.getElementById(
    'counselModal'
);

const counselTextArea =
document.getElementById(
    'counselTextArea'
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

    if(target){

        target.classList.add(
            'active'
        );
    }
}

/* =========================
   테이블 화면 표시
========================= */

function showTableArea(){

    if(crmTableArea){

        crmTableArea.style.display =
        'block';
    }

    if(memoArea){

        memoArea.classList.remove(
            'show'
        );
    }
}

/* =========================
   메모 화면 표시
========================= */

function showMemoArea(){

    if(crmTableArea){

        crmTableArea.style.display =
        'none';
    }

    if(memoArea){

        memoArea.classList.add(
            'show'
        );
    }

    const memoBox =
    document.getElementById(
        'memoTextArea'
    );

    if(memoBox){

        memoBox.value =
        localStorage.getItem(
            MEMO_STORAGE_KEY
        ) || '';

        setTimeout(()=>{

            memoBox.focus();

        },50);
    }
}

/* =========================
   메모 저장
========================= */

function saveMemoText(){

    const memoBox =
    document.getElementById(
        'memoTextArea'
    );

    if(!memoBox){

        alert(
            '메모 입력창을 찾을 수 없습니다.'
        );

        return;
    }

    localStorage.setItem(
        MEMO_STORAGE_KEY,
        memoBox.value
    );

    alert(
        '메모 저장 완료'
    );
}

/* =========================
   HTML 이스케이프
========================= */

function escapeHTML(value){

    return String(value || '')
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;')
    .replace(/'/g,'&#039;');
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

        showTableArea();

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

            status:'',

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

        if(introduceBtn){

            introduceBtn.click();
        }
    };
}

/* =========================
   소개명단
========================= */

if(introduceBtn){

    introduceBtn.onclick =
    async function(){

        currentMode =
        'introduce';

        showTableArea();

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
}

/* =========================
   고객명단
========================= */

if(customerBtn){

    customerBtn.onclick =
    async function(){

        currentMode =
        'customer';

        showTableArea();

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
}

/* =========================
   상담예정
========================= */

if(reserveBtn){

    reserveBtn.onclick =
    async function(){

        currentMode =
        'reserve';

        showTableArea();

        setActiveButton(
            reserveBtn
        );

        loadReserveList();
    };
}

/* =========================
   메모
========================= */

if(memoBtn){

    memoBtn.onclick =
    function(){

        currentMode =
        'memo';

        setActiveButton(
            memoBtn
        );

        showMemoArea();
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
   상담예정 로드
========================= */

async function loadReserveList(){

    const newReserveResult =
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

    const reReserveResult =
    await supabaseClient

    .from('crm_customers')

    .select('*')

    .eq(
        'consult_done',
        true
    )

    .eq(
        'status',
        '상담예정'
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
    )

    .neq(
        'status',
        '상담완료'
    );

    const newReserveData =
    (newReserveResult.data || []).map(item=>({

        ...item,

        source_table:
        'crm_customers'

    }));

    const reReserveData =
    (reReserveResult.data || []).map(item=>({

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

        ...newReserveData,
        ...reReserveData,
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
   종료 처리
========================= */

async function completeConsult(id, table){

    let updateData = {};

    if(table === 'crm_customers'){

        updateData = {

            consult_done:true,

            status:'상담완료',

            reserve_date:''

        };
    }

    if(table === 'notes'){

        updateData = {

            status:'상담완료',

            reserve_date:''

        };
    }

    const result =
    await supabaseClient

    .from(table)

    .update(updateData)

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

    showTableArea();

    const body =
    document.getElementById(
        'crmBody'
    );

    if(!body){

        return;
    }

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

        const counselText =
        item.memo || item.status || '';

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

                ${escapeHTML(item.name || '')}

            </td>

            <td class="editable-cell"
                data-id="${item.id}"
                data-table="${tableName}"
                data-field="phone">

                ${escapeHTML(formatPhoneNumber(
                    item.phone || ''
                ))}

            </td>

            <td>

                ${escapeHTML(createdDate)}

            </td>

            <td>

                <input
                    type="text"
                    class="status-input"
                    data-id="${item.id}"
                    data-table="${tableName}"
                    value="${escapeHTML(counselText)}"
                    placeholder="상담내용 입력"
                    readonly
                >

            </td>

            <td class="editable-reserve"
                data-id="${item.id}"
                data-table="${tableName}">

                ${escapeHTML(item.reserve_date || '')}

            </td>

            <td>

                ${
                    currentMode === 'reserve'
                    &&
                    hasReserve

                    ?

                    `<button
                        class="finish-btn"
                        data-id="${item.id}"
                        data-table="${tableName}"
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
    bindStatusInputs();
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
   상담내용 창 열기
========================= */

function openCounselModal(id, table, value){

    counselTarget = {
        id:id,
        table:table
    };

    if(counselTextArea){

        counselTextArea.value =
        value || '';
    }

    if(counselModal){

        counselModal.classList.add(
            'show'
        );
    }

    setTimeout(()=>{

        if(counselTextArea){

            counselTextArea.focus();
        }

    },50);
}

/* =========================
   상담내용 창 닫기
========================= */

function closeCounselModal(){

    if(counselModal){

        counselModal.classList.remove(
            'show'
        );
    }

    counselTarget = {
        id:null,
        table:null
    };

    if(counselTextArea){

        counselTextArea.value =
        '';
    }
}

/* =========================
   상담내용 저장
========================= */

async function saveCounselModal(){

    if(!counselTarget.id || !counselTarget.table){

        closeCounselModal();
        return;
    }

    const value =
    counselTextArea
    ?
    counselTextArea.value.trim()
    :
    '';

    let result =
    await supabaseClient

    .from(counselTarget.table)

    .update({

        memo:value

    })

    .eq(
        'id',
        counselTarget.id
    );

    if(result.error){

        result =
        await supabaseClient

        .from(counselTarget.table)

        .update({

            status:value

        })

        .eq(
            'id',
            counselTarget.id
        );
    }

    if(result.error){

        console.log(
            result.error
        );

        alert(
            '상담내용 저장 실패'
        );

        return;
    }

    closeCounselModal();

    refreshCurrentMode();
}

/* =========================
   상태 칸 클릭 → A4 1/4 창 열기
========================= */

function bindStatusInputs(){

    const inputs =
    document.querySelectorAll(
        '.status-input'
    );

    inputs.forEach(input=>{

        input.onclick =
        function(){

            const id =
            this.dataset.id;

            const table =
            this.dataset.table;

            const value =
            this.value;

            openCounselModal(
                id,
                table,
                value
            );
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
                this.dataset.id,
                this.dataset.table
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

            let updateData = {

                reserve_date:value

            };

            if(
                currentMode === 'customer'
                &&
                value !== current
            ){

                if(table === 'crm_customers'){

                    updateData = {

                        reserve_date:value,

                        consult_done:true,

                        status:'상담예정'

                    };
                }

                if(table === 'notes'){

                    updateData = {

                        reserve_date:value,

                        status:'상담예정'

                    };
                }
            }

            const result =
            await supabaseClient

            .from(table)

            .update(updateData)

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
   전체 클릭 이벤트
========================= */

document.addEventListener(
    'click',
    function(e){

        if(e.target && e.target.id === 'memoSaveBtn'){

            e.preventDefault();
            e.stopPropagation();

            saveMemoText();
            return;
        }

        if(e.target && e.target.id === 'counselSaveBtn'){

            e.preventDefault();
            e.stopPropagation();

            saveCounselModal();
            return;
        }

        if(e.target && e.target.id === 'counselCancelBtn'){

            e.preventDefault();
            e.stopPropagation();

            closeCounselModal();
            return;
        }

        if(e.target && e.target.id === 'counselCloseBtn'){

            e.preventDefault();
            e.stopPropagation();

            closeCounselModal();
            return;
        }

        if(e.target && e.target.id === 'counselModal'){

            closeCounselModal();
            return;
        }
    }
);

/* =========================
   키보드 이벤트
========================= */

document.addEventListener(
    'keydown',
    function(e){

        if(e.key === 'Escape'){

            closeCounselModal();
        }

        if(
            e.ctrlKey
            &&
            e.key === 'Enter'
            &&
            counselModal
            &&
            counselModal.classList.contains('show')
        ){

            saveCounselModal();
        }

        if(
            e.ctrlKey
            &&
            e.key === 's'
            &&
            currentMode === 'memo'
        ){

            e.preventDefault();

            saveMemoText();
        }
    }
);

/* =========================
   새로고침
========================= */

function refreshCurrentMode(){

    if(currentMode === 'memo'){

        showMemoArea();
        return;
    }

    if(currentMode === 'reserve'){

        loadReserveList();
        return;
    }

    if(currentMode === 'customer'){

        if(customerBtn){

            customerBtn.click();
        }

        return;
    }

    if(introduceBtn){

        introduceBtn.click();
    }
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

        if(
            counselModal &&
            counselModal.classList.contains('show')
        ){

            return;
        }

        if(currentMode !== 'memo'){

            refreshCurrentMode();
        }
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

        if(
            counselModal &&
            counselModal.classList.contains('show')
        ){

            return;
        }

        if(
            currentMode === 'customer'
            ||
            currentMode === 'reserve'
        ){

            refreshCurrentMode();
        }
    }
)

.subscribe();

/* =========================
   시작
========================= */

if(introduceBtn){

    introduceBtn.click();
}
