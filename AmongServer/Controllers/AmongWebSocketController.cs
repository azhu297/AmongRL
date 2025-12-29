using System.Collections.Concurrent;
using System.Net.WebSockets;
using System.Text;
using System.Text.Json;
using Microsoft.AspNetCore.Mvc;

namespace AmongServer.Controllers;

[ApiController]
[Route("api/ws/among")]
public class AmongWebSocketController : ControllerBase
{
    // Thread-safe collection of connected players
    private static readonly ConcurrentDictionary<Guid, WebSocket> Connections = new();

    [HttpGet]
    public async Task Get()
    {
        if (!HttpContext.WebSockets.IsWebSocketRequest)
        {
            HttpContext.Response.StatusCode = StatusCodes.Status400BadRequest;
            return;
        }

        using var socket = await HttpContext.WebSockets.AcceptWebSocketAsync();
        var connectionId = Guid.NewGuid();

        Connections[connectionId] = socket;

        try
        {
            await HandleConnection(connectionId, socket);
        }
        finally
        {
            Connections.TryRemove(connectionId, out _);
        }
    }

    private async Task HandleConnection(Guid id, WebSocket socket)
    {
        var buffer = new byte[1024 * 4];

        while (socket.State == WebSocketState.Open)
        {
            var result = await socket.ReceiveAsync(
                new ArraySegment<byte>(buffer),
                CancellationToken.None
            );

            if (result.MessageType == WebSocketMessageType.Close) {
                break;
            }

            var json = Encoding.UTF8.GetString(buffer, 0, result.Count);

            using var doc = JsonDocument.Parse(json);
            var type = doc.RootElement.GetProperty("type").GetString();

            if (type == "REPORT_BODY")
            {
                await BroadcastAsync(new
                {
                    type = "MEETING"
                });
            }
        }

        await socket.CloseAsync(
            WebSocketCloseStatus.NormalClosure,
            "Connection closed",
            CancellationToken.None
        );
    }

    private static async Task BroadcastAsync(object payload)
    {
        var json = JsonSerializer.Serialize(payload);
        var bytes = Encoding.UTF8.GetBytes(json);

        foreach (var socket in Connections.Values)
        {
            if (socket.State != WebSocketState.Open) {
                continue;
            }

            await socket.SendAsync(
                new ArraySegment<byte>(bytes),
                WebSocketMessageType.Text,
                true,
                CancellationToken.None
            );
        }
    }
}
