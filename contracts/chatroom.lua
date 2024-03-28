-- TO ADD: Leave Room Handler and MORE...

local json = require("json");

MAX_MESSAGES = 100        -- Maximum Number of messages that can be stored in the Messages Table
Members = Members or {}   -- List of all the Participants' Process IDs
Messages = Messages or {} -- Stores current Messages with their TimeStamps and Process

function ValueExists(table, value)
    for _, v in ipairs(table) do
        if v == value then
            return true
        end
    end
    return false
end

Handlers.add(
    "Register",
    Handlers.utils.hasMatchingTag("Action", "Register"),
    function(msg)
        if ValueExists(Members, msg.From) then
            Handlers.utils.reply("You are already registered!")(msg)
        else
            table.insert(Members, msg.From)
            print(msg.From .. " just joined the chatroom")
            Handlers.utils.reply("Welcome to the Chatroom!!!")(msg)
        end
    end
)

Handlers.add(
    "Broadcast",
    Handlers.utils.hasMatchingTag("Action", "Broadcast"),
    function(msg)
        if Balances[msg.From] == nil or tonumber(Balances[msg.From]) < 1 then
            print("UNAUTORIZED REQUEST: " .. msg.From)
            Handlers.utils.reply("Get Tokens to Send Messages")(msg)
            return
        end

        print("Broadcasting message from " .. msg.From .. " Content: " .. msg.Data)

        if #Messages == MAX_MESSAGES then
            table.remove(Messages, 0)
        end

        table.insert(Messages, {
            from = msg.From,
            timestamp = msg.Timestamp,
            data = msg.Data,
        })
    end
)

Handlers.add(
    "Get All Participants",
    Handlers.utils.hasMatchingTag("Action", "Get-Participants"),
    function(msg)
        Handlers.utils.reply(json.encode(Members))(msg)
    end
)

Handlers.add(
    "Get Latest Message",
    Handlers.utils.hasMatchingTag("Action", "Get-Latest-Message"),
    function(msg)
        if tonumber(msg.Tags.LatestTimeStamp) < Messages[#Messages].timestamp then
            Handlers.utils.reply(Messages[#Messages])(msg)
        else
            Handlers.utils.reply("Up to date")(msg)
        end
    end
)

Handlers.add(
    "Clear Messages",
    Handlers.utils.hasMatchingTag("Action", "Clear"),
    function(msg)
        if msg.From == ao.id then
            Messages = {}
            Handlers.utils.reply("Cleared")(msg)
        end
    end
)
