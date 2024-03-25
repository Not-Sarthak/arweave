-- TO ADD: Leave Room Handler and MORE...

function ValueExists(table, value)
    for _, v in ipairs(table) do
        if v == value then
            return true
        end
    end
    return false
end

Members = Members or {}

Handlers.add(
    "Register",
    Handlers.utils.hasMatchingTag("Action", "Register"),
    function(msg)
        if ValueExists(Members, msg.From) then
            Handlers.utils.reply("You are already registered!")(msg)
        else
            print(msg.From .. " just joined the chatroom")
            table.insert(Members, msg.From)
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
            return
        end

        local type = msg.Type or "Normal"
        print("Broadcasting message from " .. msg.From .. ". Content: " .. msg.Data)

        for _, recipient in ipairs(Members) do
            ao.send({ Target = recipient, Data = msg.Data })
        end
        Handlers.utils.reply("Broadcasted.")(msg)
    end
)

Handlers.add(
    "Get All Participants",
    Handlers.utils.hasMatchingTag("Action", "Get-Participants"),
    function(msg)
        print(Members)
        Handlers.utils.reply(tostring(Members))(msg)
    end
)
