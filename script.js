// ============================================
// 실시간 새로고침
// ============================================

const leadsChannel =

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
            '실시간 leads:',
            payload
        );

        location.reload();
    }
)

.subscribe();




const notesChannel =

supabaseClient

.channel('realtime-notes')

.on(

    'postgres_changes',

    {
        event:'INSERT',

        schema:'public',

        table:'notes'
    },

    payload=>{

        console.log(
            '실시간 notes:',
            payload
        );

        location.reload();
    }
)

.subscribe();
