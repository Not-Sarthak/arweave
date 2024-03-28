-- Process ID: MD76snAyJJICvDt2rhhA68zIjPSIYJDKuyQ19yFiTGE

_0RBIT = "WSXUI2JjYUldJ7CKq9wE1MGwXs-ldzlUlHOQszwQe0s"

BASE_URL = "https://crypto-news16.p.rapidapi.com/news/top/5"

REQUESTS = {}

Handlers.add(
    "GetNews",
    Handlers.utils.hasMatchingTag("Action", "Get-News"),
    function(msg)
        table.insert(REQUESTS, msg.From)
        -- ao.send({
        --     Target = _0RBIT,
        --     Action = "Get-Real-Data",
        --     Url = BASE_URL
        -- })

        -- Sending Dummy Data for now as there are some issues with 0rbit
        ao.send({
            Target = msg.From,
            Data = "Breaking NEWS!!!"
        })
        table.remove(REQUESTS, 0)
    end
)

-- Handlers.add(
--     "ReceivingData",
--     Handlers.utils.hasMatchingTag("Action", "Receive-data-feed"),
--     function(msg)
--         ao.send({
--             Target = msg.From,
--             Data = Inbox[#Inbox].Data
--         })
--         table.remove(REQUESTS, 0)
--     end
-- )
