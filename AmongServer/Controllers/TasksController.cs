using Microsoft.AspNetCore.Mvc;

namespace AmongServer.Controllers;

[ApiController]
[Route("api/tasks")]
public class TasksController : ControllerBase
{
    public static List<string> Tasks =
    [
        "Weigh ___ onions.",
        "Put the salt somewhere else in the kitchen.",
        "Have a drink.",
        "Put a beer in the fridge or put a beer in the crate.",
        "Play table tennis with someone else until one of you scores 3 points.",
        "Sit in the sauna for 60 seconds.",
        "Text +49 1590 8455076 (Simon) with a 'your mother' joke. Simon will choose someone to write to.",
        "Take the broom and quickly sweep the hallway.",
        "Stack the toilet paper rolls into a tower or place them individually around the room.",
        "Bring a log from outside and place it in the wood basket.",
        "Go out on the balcony and howl like a wolf.",
        "Play your best song on the piano.",
        "Swap two chairs in the living room.",
        "Swap two shoes in the cloakroom.",
        "Squat down on the terrace and say a loud grace.",
        "Go to the garage and touch the ladder.",
        "Go to the street and write down the license plate number of _______ in the group.",
        "Put laundry in the washing machine or put it back in the basket.",
        "Choose a person of your choice and follow them for at least 60 seconds.",
        "Introduce yourself to the same person 3 times in different ways. Name and gender must always be mentioned.",
        "Wash your hands.",
        "Touch two different water taps at the same time.",
        "Sit or lie down in the bathtub.",
        "Move on all fours to a room two rooms away.",
        "Grab a book and read 5 sentences.",
        "Curl up in the fireplace corner and throw a blanket over yourself. Count to 20.",
        "Write a short praise for good bread on the piece of paper in the kitchen.",
        "Turn around six times in the broom closet (clockwise).",
        "Do three push-ups of your choice in the hallway.",
        "Search for a hidden door in the hallway for 10 seconds (tap/listen/etc.).",
        "Count the steps in the house.",
        "Put the laundry clips on the drying line or put them back in the basket.",
        "Find a mirror and flex until you're satisfied.",
        "Put the pillows in the living room in the corner by the fireplace or on the couch.",
        "Fold a blanket in the loft bedroom or lay it out on the floor.",
        "Go into the single bedroom and meditate there for 60 seconds with your eyes closed.",
        "Stand in the shower and close the shower door.",
        "Go outside through one door and come back in through another.",
        "Carry _________ from the balcony to the terrace or vice versa.",
        "Make a chess move in the double bedroom for the corresponding color.",
        "Take a selfie with anyone you like.",
    ];

    [HttpGet]
    public ActionResult GetTasks()
    {
        // Return random 6 tasks
        var randomTasks = Tasks
            .OrderBy(_ => Guid.NewGuid())
            .Take(6)
            .ToList();

        return Ok(randomTasks);
    }
}