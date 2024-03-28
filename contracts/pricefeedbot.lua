-- Process ID: MD76snAyJJICvDt2rhhA68zIjPSIYJDKuyQ19yFiTGE

local json = require("json")

-- processId of the 0rbit process.
_0RBIT = "WSXUI2JjYUldJ7CKq9wE1MGwXs-ldzlUlHOQszwQe0s"

-- Base URL for coingecko API
BASE_URL = "https://api.coingecko.com/api/v3/simple/price"


--[[
    Mapping to store the token prices with their coingecko id
]]
TOKEN_PRICES = TOKEN_PRICES or {
    BTC = {
        coingecko_id = "bitcoin",
        price = 60000,
        last_update_timestamp = 0
    },
    ETH = {
        coingecko_id = "ethereum",
        price = 4000,
        last_update_timestamp = 0
    },
    SOL = {
        coingecko_id = "solana",
        price = 200,
        last_update_timestamp = 0
    }
}

--[[
    Mapping to store requested token to add to price feed.
]]
REQUESTED_TOKENS = REQUESTED_TOKENS or {}

--[[

]]
LOGS = LOGS or {}

--[[
    This function is used to add a new token to the TOKEN_PRICES table
    @param {string} token - The token to add
    @notice Only the process owner can add tokens
]]
Handlers.add(
    "AddToken",
    Handlers.utils.hasMatchingTag("Action", "Add-Token"),
    function(msg)
        if msg.From == ao.id then
            local token = msg.Tags.Token
            local coingecko_id = msg.Tags.CoingeckoId

            if not TOKEN_PRICES[token] then
                TOKEN_PRICES[token].price = 0
                TOKEN_PRICES[token].coingecko_id = coingecko_id
                ao.send({
                    Target = msg.From,
                    Tags = {
                        Action = 'Add Token Success',
                        ['Message-Id'] = msg.Id,
                        Token = token
                    }
                })
            else
                ao.send({
                    Target = msg.From,
                    Tags = {
                        Action = 'Add Token Error',
                        ['Message-Id'] = msg.Id,
                        Error = 'Token already exists'
                    }
                })
            end

            -- For Debugging
            table.insert(
                LOGS,
                {
                    From = msg.From,
                    Tag = "Add-Token",
                    Data = {
                        Token = token,
                        Message = "Success"
                    }
                }
            )
        else
            ao.send({
                Target = msg.From,
                Tags = {
                    Action = 'Add Token Error',
                    ['Message-Id'] = msg.Id,
                    Error = 'Only the Process Owner can add tokens'
                }
            })

            -- For Debugging
            table.insert(
                LOGS,
                {
                    From = msg.From,
                    Tag = "Add-Token",
                    Data = {
                        Message = "Not Owner"
                    }
                }
            )
        end
    end
)

--[[
    Function to request token addition in the price-feed
]]
Handlers.add(
    "RequestAddToken",
    Handlers.utils.hasMatchingTag("Action", "Request-Add-Token"),
    function(msg)
        local token = msg.Tags.Token
        local chain_id = msg.Tags.ChainId

        assert(type(token) == "string", "Token Name for token addition is required")
        assert(type(chain_id) == "string", "Chain Id for token addition is required")

        REQUESTED_TOKENS[token] = chain_id

        ao.send {
            Target = msg.From,
            Tags = {
                Action = 'Token Addition Request'
            },
            Data = "Your token request addition submitted!"
        }
        table.insert(
            LOGS,
            {
                From = msg.From,
                Tag = "Request-Add-Token",
                Data = {
                    Token = token,
                    ChainId = chain_id,
                    Message = "Success"
                }
            }
        )
    end
)

--[[
    This function is used to get the BTC price from the TOKEN_PRICES table
]]
Handlers.add(
    "GetPrice",
    Handlers.utils.hasMatchingTag("Action", "Get-Price"),
    function(msg)
        local token = msg.Tags.Token
        local price = TOKEN_PRICES[token].price

        if price == 0 then
            ao.send({
                Target = msg.From,
                Tags = {
                    Action = 'Get-Price Error',
                    ['Message-Id'] = msg.Id,
                    Error = 'Price not available! Please contact @0rbitco on X'
                }
            })
            return
        else
            Send({
                Target = msg.From,
                Tags = {
                    ['Message-Id'] = msg.Id,
                    Price = tostring(price)
                }
            })
        end
        table.insert(
            LOGS,
            {
                From = msg.From,
                Tag = "Request-Add-Token",
                Data = {
                    Token = token,
                    Message = "Success"
                }
            }
        )
    end
)

--[[
    CRON FUNCTIONS TO UPDATE THE TOKEN PRICES
]]
Handlers.add(
    "CronTick",
    Handlers.utils.hasMatchingTag("Action", "Cron"),
    function()
        local url;
        local token_ids;

        for _, v in pairs(TOKEN_PRICES) do
            token_ids = token_ids .. v.coingecko_id .. ","
        end

        url = BASE_URL .. "?ids=" .. token_ids .. "&vs_currencies=usd"

        ao.send({
            Target = _0RBIT,
            Action = "Get-Real-Data",
            Url = url
        })
    end
)

Handlers.add(
    "ReceivingData",
    Handlers.utils.hasMatchingTag("Action", "Receive-data-feed"),
    function(msg)
        local res = json.decode(msg.Data)
        for k, v in pairs(res) do
            TOKEN_PRICES[k].price = v
            TOKEN_PRICES[k].last_update_timestamp = msg.Timestamp
        end
    end
)
