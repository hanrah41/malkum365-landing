/* =====================================================
   CUSTOMER CRM
   파일: C:\malkum365-landing\crm.js

   수정 내용:
   - notes 데이터는 고객명단에 표시
   - 소개명단은 crm_customers 데이터만 표시
   - 상담예정 종료 버튼 클릭 시 고객명단으로 이동
   - 종료 후 소개명단으로 들어가는 버그 수정
   - 상담내용 줄바꿈 저장 보존 유지
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
   - 줄바꿈 보존
   - trim() 사용 안 함
========================= */

function normalizeMultiline(value){

    return String(value ?? '')
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n');
}


/* =========================
   날짜 정렬용 값
========================= */

function getSortTime(item){

    const value =
    item.reserve_date ||
    item.created_at ||
    item.created_text ||
    '';

    const time =
    new Date(value).getTime();

    if(Number.isNaN(time)){

        return 0;
    }

    return time;
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
   - textarea.value 그대로 저장
   - 줄바꿈 보존
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
   - 소개등록에서 수동 등록한 데이터는 crm_customers에 저장
   - 따라서 소개명단에 표시됨
   - notes로 들어온 외부 데이터와 분리
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

        const phone =
        prompt(
            '연락처 입력'
        ) || '';

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
   - crm_customers 데이터만 표시
   - notes 데이터는 여기 표시하지 않음
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
   - notes 데이터 표시
   - crm_customers 데이터도 함께 표시
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
    async function(){

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
   - crm_customers 전용
========================= */

async function loadIntroduceList(){

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

    const data =
    (result.data || []).map(item=>({

        ...item,

        source_table:
        'crm_customers',

        created_text:
        item.created_at || ''

    }));

    renderTable(
        data
    );
}


/* =========================
   고객명단 로드
   - notes + crm_customers 통합
   - notes에서 넘어온 데이터는 고객명단에 표시
========================= */

async function loadCustomers(){

    const notesResult =
    await supabaseClient

    .from('notes')

    .select('*');

    const crmResult =
    await supabaseClient

    .from('crm_customers')

    .select('*');

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
        item.created_at || ''

    }));

    const crmData =
    (crmResult.data || []).map(item=>({

        ...item,

        source_table:
        'crm_customers',

        created_text:
        item.created_at || ''

    }));

    const merged =
    [
        ...notesData,
        ...crmData
    ];

    merged.sort((a,b)=>{

        return getSortTime(b) - getSortTime(a);
    });

    renderTable(
        merged
    );
}


/* =========================
   상담예정 통합 로드
   - notes + crm_customers 중 reserve_date 있는 것만 표시
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
        item.created_at || ''

    }));

    const crmData =
    (crmResult.data || []).map(item=>({

        ...item,

        source_table:
        'crm_customers',

        created_text:
        item.created_at || ''

    }));

    const merged =
    [
        ...notesData,
        ...crmData
    ];

    merged.sort((a,b)=>{

        return getSortTime(a) - getSortTime(b);
    });

    renderTable(
        merged
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
                ${escapeHTML(item.phone || '')}
            </td>

            <td>
                ${escapeHTML(createdText)}
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

            const result =
            await supabaseClient

            .from(tableName)

            .update({

                [field]:
                value

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

            refreshCurrentMode();
        };
    });
}


/* =========================
   상담예정 종료 버튼
   핵심 수정:
   - reserve_date 삭제
   - currentMode를 customer로 변경
   - 고객명단 버튼 활성화
   - 고객명단 목록으로 이동
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

            const result =
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

async function loadMemo(){

    if(!memoTextArea){

        return;
    }

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
    )

    .limit(
        1
    );

    if(result.error){

        console.error(
            result.error
        );

        memoTextArea.value =
        '';

        return;
    }

    if(result.data && result.data.length > 0){

        memoTextArea.value =
        normalizeMultiline(
            result.data[0].memo || ''
        );

    }else{

        memoTextArea.value =
        '';
    }
}


/* =========================
   메모 저장
========================= */

if(memoSaveBtn){

    memoSaveBtn.onclick =
    async function(){

        const value =
        normalizeMultiline(
            memoTextArea ? memoTextArea.value : ''
        );

        const result =
        await supabaseClient

        .from('crm_customers')

        .insert([{

            name:
            '메모',

            phone:
            '',

            created_at:
            new Date().toISOString(),

            status:
            '메모',

            memo:
            value,

            reserve_date:
            null

        }])

        .select();

        if(result.error){

            console.error(
                result.error
            );

            alert(
                '메모 저장 실패'
            );

            return;
        }

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
   - notes 변경 시 고객명단/상담예정에서만 갱신
   - 소개명단으로 보내지 않음
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

        refreshCurrentMode();
    }
)

.subscribe();


/* =========================
   시작
   - 기본 시작 화면을 고객명단으로 변경
   - notes 데이터가 소개명단으로 뜨지 않도록 함
========================= */

if(customerBtn){

    setActiveButton(
        customerBtn
    );
}

showTableArea();

loadCustomers();
