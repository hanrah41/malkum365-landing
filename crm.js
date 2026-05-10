/* =========================================
Supabase 연결
========================================= */

const SUPABASE_URL =
'https://pziyabogqefxzvinwarg.supabase.co';

const SUPABASE_KEY =
'sb_publishable_VrVP0buVQ3kCBiQm88Jr5g_q61_DoK8';

const supabaseClient =
supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);

/* =========================================
테이블 body
========================================= */

const crmTableBody =
document.getElementById(
    'crmTableBody'
);

/* =========================================
고객 데이터 불러오기
========================================= */

async function loadCRM(){

    const { data, error } =

    await supabaseClient

    .from('notes')

    .select(`
        *,
        leads (
            id,
            name,
            phone,
            consultation
        )
    `)

    .order(
        'created_at',
        {
            ascending:false
        }
    );

    if(error){

        console.error(error);
        return;
    }

    renderCRM(data);
}

/* =========================================
LED 상태 계산
========================================= */

function getLEDClass(item){

    if(item.purchase === true){

        return 'led-purchase';
    }

    if(item.alarm_checked === true){

        return 'led-complete';
    }

    if(item.alarm_30m === true){

        return 'led-alarm';
    }

    if(item.today_mark === true){

        return 'led-today';
    }

    return 'led-default';
}

/* =========================================
테이블 출력
========================================= */

function renderCRM(data){

    crmTableBody.innerHTML = '';

    data.forEach(item=>{

        const row =
        document.createElement('tr');

        const ledClass =
        getLEDClass(item);

        row.innerHTML = `

            <td>
                ${item.customer_id || '-'}
            </td>

            <td>

                <span class="
                    status-led
                    ${ledClass}
                "></span>

            </td>

            <td>
                ${item.leads?.name || '-'}
            </td>

            <td>
                ${item.leads?.phone || '-'}
            </td>

            <td>
                ${item.leads?.consultation || '-'}
            </td>

            <td>
                ${item.schedule || '-'}
            </td>

            <td>
                ${item.etc || '-'}
            </td>

        `;

        crmTableBody.appendChild(row);

    });

}

/* =========================================
실시간 감지
========================================= */

supabaseClient

.channel('crm-realtime')

.on(

    'postgres_changes',

    {

        event:'*',

        schema:'public',

        table:'notes'

    },

    payload=>{

        console.log(
            '실시간 notes 변경:',
            payload
        );

        loadCRM();
    }

)

.subscribe();

/* =========================================
최초 실행
========================================= */

loadCRM();
