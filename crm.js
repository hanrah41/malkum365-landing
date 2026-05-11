/* =====================================================
   CUSTOMER CRM
   파일: C:\malkum365-landing\crm.js

   수정 내용:
   - 소개등록 → 소개명단 표시
   - 소개명단에서 상담예정일 입력해도 소개명단에 계속 유지
   - 상담예정일 입력된 소개등록자는 상담예정에도 함께 표시
   - 상담예정에서 종료 버튼 클릭 시 고객명단으로 이동
   - 종료 후 소개명단에서는 사라짐
   - 메모는 localStorage에만 저장
   - 메모 행은 소개명단/고객명단/상담예정에 표시하지 않음
   - 상담내용 줄바꿈 저장 보존
   - 전화번호 하이픈 표시
   - 상담신청일 표시 형식: 2026-05-12   10:30
===================================================== */


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

let currentMode =
'customer';

let currentEditId =
null;

let currentEditField =
null;

let currentEditTable =
'notes';


/* =========================
   메모 localStorage key
========================= */

const MEMO_STORAGE_KEY =
'malkum365_customer_memo';


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
   화면 요소
========================= */

const crmTableArea =
document.getElementById(
    'crmTableArea'
);

const memoArea =
document.getElementById(
    'memoArea'
);

const crmBody =
document.getElementById(
    'crmBody'
);

const counselModal =
document.getElementById(
    'counselModal'
);

const counselTextArea =
document.getElementById(
    'counselTextArea'
);

const counselCloseBtn =
document.getElementById(
    'counselCloseBtn'
);

const counselCancelBtn =
document.getElementById(
    'counselCancelBtn'
);

const counselSaveBtn =
document.getElementById(
    'counselSaveBtn'
);

const memoTextArea =
document.getElementById(
    'memoTextArea'
);

const memoSaveBtn =
document.getElementById(
    'memoSaveBtn'
);


/* =========================
   HTML escape
========================= */

function escapeHTML(value){

    return String(value ?? '')
    .replaceAll('&','&amp;')
    .replaceAll('<','&lt;')
    .replaceAll('>','&gt;')
    .replaceAll('"','&quot;')
    .replaceAll("'","&#039;");
}


/* =========================
   테이블 표시용 텍스트
========================= */

function toDisplayText(value){

    return String(value ?? '')
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\n+/g, ' / ')
    .trim();
}


/* =========================
   원문 보존용 정규화
========================= */

function normalizeMultiline(value){

    return String(value ?? '')
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n');
}


/* =========================
   전화번호 숫자만 추출
========================= */

function onlyPhoneDigits(value){

    return String(value ?? '')
    .replace(/[^0-9]/g, '');
}


/* =========================
   전화번호 표시 형식
========================= */

function formatPhone(value){

    const digits =
    onlyPhoneDigits(
        value
    );

    if(digits.length === 11){

        return digits.replace(
            /(\d{3})(\d{4})(\d{4})/,
            '$1-$2-$3'
        );
    }

    if(digits.length === 10){

        if(digits.startsWith('02')){

            return digits.replace(
                /(\d{2})(\d{4})(\d{4})/,
                '$1-$2-$3'
            );
        }

        return digits.replace(
            /(\d{3})(\d{3})(\d{4})/,
            '$1-$2-$3'
        );
    }

    return String(value ?? '');
}


/* =========================
   상담신청일 표시 형식
   목표:
   2026-05-12   10:30
========================= */

function formatDateTimeDisplay(value){

    if(!value){

        return '';
    }

    const text =
    String(value);

    let datePart =
    '';

    let timePart =
    '';

    if(text.includes('T')){

        const parts =
        text.split('T');

        datePart =
        parts[0] || '';

        timePart =
        (parts[1] || '').substring(0,5);

        return `${datePart}   ${timePart}`;
    }

    if(text.includes(' ')){

        const parts =
        text.split(' ');

        datePart =
        parts[0] || '';

        timePart =
        parts.find(part=>part.includes(':')) || '';

        timePart =
        timePart.substring(0,5);

        if(datePart && timePart){

            return `${datePart}   ${timePart}`;
        }
    }

    return text;
}


/* =========================
   날짜 정렬용 값
========================= */

function getSortTime(item){

    const value =
    item.reserve_date ||
    item.created_text ||
    item.created_at ||
    '';

    const time =
    new Date(value).getTime();

    if(Number.isNaN(time)){

        return 0;
    }

    return time;
}


/* =========================
   메모 행 제거 필터
========================= */

function removeMemoRows(list){

    if(!Array.isArray(list)){

        return [];
    }

    return list.filter(item=>{

        const name =
        String(item.name ?? '')
        .trim();

        const status =
        String(item.status ?? '')
        .trim();

        if(name === '메모'){

            return false;
        }

        if(status === '메모'){

            return false;
        }

        return true;
    });
}


/* =========================
   중복 신청 표시 제거
========================= */

function removeDuplicateSubmissions(list){

    if(!Array.isArray(list)){

        return [];
    }

    const noMemoList =
    removeMemoRows(
        list
    );

    const sorted =
    [...noMemoList].sort((a,b)=>{

        return getSortTime(b) - getSortTime(a);
    });

    const result =
    [];

    sorted.forEach(item=>{

        const name =
        String(item.name ?? '')
        .trim();

        const phone =
        onlyPhoneDigits(
            item.phone
        );

        const tableName =
        item.source_table || '';

        const itemTime =
        getSortTime(
            item
        );

        const isDuplicate =
        result.some(existing=>{

            const existingName =
            String(existing.name ?? '')
            .trim();

            const existingPhone =
            onlyPhoneDigits(
                existing.phone
            );

            const existingTable =
            existing.source_table || '';

            const existingTime =
            getSortTime(
                existing
            );

            const diff =
            Math.abs(
                existingTime - itemTime
            );

            return (
                name !== '' &&
                phone !== '' &&
                name === existingName &&
                phone === existingPhone &&
                tableName === existingTable &&
                diff <= 10000
            );
        });

        if(!isDuplicate){

            result.push(
                item
            );
        }
    });

    return result;
}


/* =========================
   공통 버튼 활성화
========================= */

function setActiveButton(target){

    if(!target){

        return;
    }

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
   화면 전환
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
}


/* =========================
   상담내용 입력창 열기
========================= */

function openCounselEditor(
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

    if(counselTextArea){

        counselTextArea.value =
        normalizeMultiline(
            value
        );
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

    }, 0);
}


/* =========================
   상담내용 입력창 닫기
========================= */

function closeCounselEditor(){

    if(counselModal){

        counselModal.classList.remove(
            'show'
        );
    }

    currentEditId =
    null;

    currentEditField =
    null;

    currentEditTable =
    'notes';
}


/* =========================
   상담내용 저장
========================= */

if(counselSaveBtn){

    counselSaveBtn.onclick =
    async function(){

        if(
            currentEditId === null ||
            currentEditField === null ||
            currentEditTable === null
        ){

            return;
        }

        const value =
        normalizeMultiline(
            counselTextArea ? counselTextArea.value : ''
        );

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

        closeCounselEditor();

        refreshCurrentMode();
    };
}


/* =========================
   상담내용 닫기 버튼
========================= */

if(counselCloseBtn){

    counselCloseBtn.onclick =
    function(){

        closeCounselEditor();
    };
}


if(counselCancelBtn){

    counselCancelBtn.onclick =
    function(){

        closeCounselEditor();
    };
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

        showTableArea();

        const name =
        prompt(
            '성명 입력'
        );

        if(!name){

            currentMode =
            'introduce';

            if(introduceBtn){

                setActiveButton(
                    introduceBtn
                );
            }

            loadIntroduceList();

            return;
        }

        const phoneInput =
        prompt(
            '연락처 입력'
        ) || '';

        const phone =
        formatPhone(
            phoneInput
        );

        const result =
        await supabaseClient

        .from('crm_customers')

        .insert([{

            name:
            name,

            phone:
            phone,

            created_at:
            new Date().toISOString(),

            status:
            '소개등록',

            reserve_date:
            null

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

        currentMode =
        'introduce';

        if(introduceBtn){

            setActiveButton(
                introduceBtn
            );
        }

        loadIntroduceList();
    };
}


/* =========================
   소개명단
========================= */

if(introduceBtn){

    introduceBtn.onclick =
    function(){

        currentMode =
        'introduce';

        setActiveButton(
            introduceBtn
        );

        showTableArea();

        loadIntroduceList();
    };
}


/* =========================
   고객명단
========================= */

if(customerBtn){

    customerBtn.onclick =
    function(){

        currentMode =
        'customer';

        setActiveButton(
            customerBtn
        );

        showTableArea();

        loadCustomers();
    };
}


/* =========================
   상담예정
========================= */

if(reserveBtn){

    reserveBtn.onclick =
    function(){

        currentMode =
        'reserve';

        setActiveButton(
            reserveBtn
        );

        showTableArea();

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

        loadMemo();
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

        showTableArea();

        if(crmBody){

            crmBody.innerHTML =
            `
                <tr>
                    <td colspan="7">
                        알람 시스템 준비중
                    </td>
                </tr>
            `;
        }
    };
}


/* =========================
   소개명단 로드
========================= */

async function loadIntroduceList(){

    const result =
    await supabaseClient

    .from('crm_customers')

    .select('*')

    .eq(
        'status',
        '소개등록'
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

    const data =
    (result.data || []).map(item=>({

        ...item,

        source_table:
        'crm_customers',

        created_text:
        item.created_text ||
        item.created_at ||
        ''

    }));

    const filtered =
    removeDuplicateSubmissions(
        removeMemoRows(
            data
        )
    );

    renderTable(
        filtered
    );
}


/* =========================
   고객명단 로드
========================= */

async function loadCustomers(){

    const notesResult =
    await supabaseClient

    .from('notes')

    .select('*');

    const crmResult =
    await supabaseClient

    .from('crm_customers')

    .select('*')

    .eq(
        'status',
        '고객명단'
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

    const notesData =
    (notesResult.data || []).map(item=>({

        ...item,

        source_table:
        'notes',

        created_text:
        item.created_text ||
        item.created_at ||
        ''

    }));

    const crmData =
    (crmResult.data || []).map(item=>({

        ...item,

        source_table:
        'crm_customers',

        created_text:
        item.created_text ||
        item.created_at ||
        ''

    }));

    const merged =
    [
        ...notesData,
        ...crmData
    ];

    const filtered =
    removeDuplicateSubmissions(
        removeMemoRows(
            merged
        )
    );

    filtered.sort((a,b)=>{

        return getSortTime(b) - getSortTime(a);
    });

    renderTable(
        filtered
    );
}


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

    const notesData =
    (notesResult.data || []).map(item=>({

        ...item,

        source_table:
        'notes',

        created_text:
        item.created_text ||
        item.created_at ||
        ''

    }));

    const crmData =
    (crmResult.data || []).map(item=>({

        ...item,

        source_table:
        'crm_customers',

        created_text:
        item.created_text ||
        item.created_at ||
        ''

    }));

    const merged =
    [
        ...notesData,
        ...crmData
    ];

    const filtered =
    removeDuplicateSubmissions(
        removeMemoRows(
            merged
        )
    );

    filtered.sort((a,b)=>{

        return getSortTime(a) - getSortTime(b);
    });

    renderTable(
        filtered
    );
}


/* =========================
   테이블 출력
========================= */

function renderTable(data){

    if(!crmBody){

        return;
    }

    crmBody.innerHTML =
    '';

    if(!data || data.length === 0){

        crmBody.innerHTML =
        `
            <tr>
                <td colspan="7">
                    표시할 데이터가 없습니다.
                </td>
            </tr>
        `;

        return;
    }

    data.forEach(item=>{

        const tr =
        document.createElement(
            'tr'
        );

        const id =
        item.id || '';

        const tableName =
        item.source_table || 'notes';

        const statusRaw =
        normalizeMultiline(
            item.status || ''
        );

        const statusDisplay =
        toDisplayText(
            item.status || '상담내용'
        ) || '상담내용';

        const createdText =
        item.created_text ||
        item.created_at ||
        '';

        const createdTextDisplay =
        formatDateTimeDisplay(
            createdText
        );

        const phoneDisplay =
        formatPhone(
            item.phone || ''
        );

        const finishButton =
        currentMode === 'reserve'
        ?
        `<button class="finish-btn" type="button" data-id="${escapeHTML(id)}" data-table="${escapeHTML(tableName)}">종료</button>`
        :
        '';

        tr.innerHTML =
        `
            <td>
                ${escapeHTML(id)}
            </td>

            <td class="editable-name"
                data-id="${escapeHTML(id)}"
                data-table="${escapeHTML(tableName)}"
                data-field="name">
                ${escapeHTML(item.name || '')}
            </td>

            <td class="editable-phone"
                data-id="${escapeHTML(id)}"
                data-table="${escapeHTML(tableName)}"
                data-field="phone">
                ${escapeHTML(phoneDisplay)}
            </td>

            <td>
                ${escapeHTML(createdTextDisplay)}
            </td>

            <td class="editable-cell editable-status"
                data-id="${escapeHTML(id)}"
                data-table="${escapeHTML(tableName)}"
                data-field="status">
                ${escapeHTML(statusDisplay)}
            </td>

            <td class="editable-reserve"
                data-id="${escapeHTML(id)}"
                data-table="${escapeHTML(tableName)}">
                ${escapeHTML(item.reserve_date || '')}
            </td>

            <td>
                ${finishButton}
            </td>
        `;

        const statusCell =
        tr.querySelector(
            '.editable-status'
        );

        if(statusCell){

            statusCell.dataset.rawValue =
            statusRaw;
        }

        crmBody.appendChild(
            tr
        );
    });

    bindNormalCellEditor();

    bindStatusEditor();

    bindReserveDateEditor();

    bindFinishButtons();
}


/* =========================
   일반 셀 수정
========================= */

function bindNormalCellEditor(){

    const cells =
    document.querySelectorAll(
        '.editable-name, .editable-phone'
    );

    cells.forEach(cell=>{

        cell.onclick =
        async function(){

            const id =
            this.dataset.id;

            const tableName =
            this.dataset.table || 'notes';

            const field =
            this.dataset.field;

            const current =
            this.innerText.trim();

            const value =
            prompt(
                `${field} 입력`,
                current
            );

            if(value === null){

                return;
            }

            let saveValue =
            value;

            if(field === 'phone'){

                saveValue =
                formatPhone(
                    value
                );
            }

            const result =
            await supabaseClient

            .from(tableName)

            .update({

                [field]:
                saveValue

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
                    'DB 저장 실패'
                );

                return;
            }

            refreshCurrentMode();
        };
    });
}


/* =========================
   상태/상담내용 입력창 열기
========================= */

function bindStatusEditor(){

    const cells =
    document.querySelectorAll(
        '.editable-status'
    );

    cells.forEach(cell=>{

        cell.onclick =
        function(){

            const id =
            this.dataset.id;

            const tableName =
            this.dataset.table || 'notes';

            const field =
            this.dataset.field || 'status';

            const rawValue =
            this.dataset.rawValue || '';

            openCounselEditor(
                tableName,
                id,
                field,
                rawValue
            );
        };
    });
}


/* =========================
   상담예정일 입력
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

            const tableName =
            this.dataset.table || 'notes';

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

            if(raw.trim() === ''){

                const clearResult =
                await supabaseClient

                .from(tableName)

                .update({

                    reserve_date:
                    null

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

            currentMode =
            'reserve';

            if(reserveBtn){

                setActiveButton(
                    reserveBtn
                );
            }

            showTableArea();

            loadReserveList();
        };
    });
}


/* =========================
   상담예정 종료 버튼
========================= */

function bindFinishButtons(){

    const finishButtons =
    document.querySelectorAll(
        '.finish-btn'
    );

    finishButtons.forEach(btn=>{

        btn.onclick =
        async function(e){

            e.stopPropagation();

            const id =
            this.dataset.id;

            const tableName =
            this.dataset.table || 'notes';

            const updateData =
            {
                reserve_date:
                null
            };

            if(tableName === 'crm_customers'){

                updateData.status =
                '고객명단';
            }

            const result =
            await supabaseClient

            .from(tableName)

            .update(
                updateData
            )

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
                    '종료 처리 실패'
                );

                return;
            }

            currentMode =
            'customer';

            if(customerBtn){

                setActiveButton(
                    customerBtn
                );
            }

            showTableArea();

            loadCustomers();
        };
    });
}


/* =========================
   메모 로드
========================= */

function loadMemo(){

    if(!memoTextArea){

        return;
    }

    const savedMemo =
    localStorage.getItem(
        MEMO_STORAGE_KEY
    );

    memoTextArea.value =
    normalizeMultiline(
        savedMemo || ''
    );
}


/* =========================
   메모 저장
========================= */

if(memoSaveBtn){

    memoSaveBtn.onclick =
    function(){

        const value =
        normalizeMultiline(
            memoTextArea ? memoTextArea.value : ''
        );

        localStorage.setItem(
            MEMO_STORAGE_KEY,
            value
        );

        alert(
            '메모 저장 완료'
        );
    };
}


/* =========================
   현재 모드 새로고침
========================= */

function refreshCurrentMode(){

    if(currentMode === 'introduce'){

        loadIntroduceList();

        return;
    }

    if(currentMode === 'customer'){

        loadCustomers();

        return;
    }

    if(currentMode === 'reserve'){

        loadReserveList();

        return;
    }

    if(currentMode === 'memo'){

        loadMemo();

        return;
    }

    if(currentMode === 'new'){

        loadIntroduceList();

        return;
    }

    loadCustomers();
}


/* =========================
   실시간 notes
========================= */

supabaseClient

.channel(
    'realtime-notes'
)

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

.channel(
    'realtime-crm-customers'
)

.on(

    'postgres_changes',

    {
        event:'*',
        schema:'public',
        table:'crm_customers'
    },

    ()=>{

        if(
            currentMode === 'introduce' ||
            currentMode === 'customer' ||
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

if(customerBtn){

    setActiveButton(
        customerBtn
    );
}

showTableArea();

loadCustomers();
