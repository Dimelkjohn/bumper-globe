// "All Our Services" arrow animation"
$(".link-btn").on("mouseover", (event) =>
{
    $(".animated-arrow").addClass("animate__animated animate__headShake");

    setTimeout(() => $(".animated-arrow").removeClass("animate__animated animate__headShake"), 1000);
});

// copyright year
var year = new Date().getFullYear();

$(".copyright").append(" " + year);

// floating action button configuration
setTimeout(() => 
{
    $(".action-btn").addClass("show-content");
}, 500);

$(".action-btn").on("mouseover", (event) => 
{
    $(".action-btn").addClass("btn-hovered");

    setTimeout(() =>
    {
        $(".action-btn i").addClass("hidden");
            
        $(".floating-btn-txt").removeClass("hidden");
        
    }, 500);
});

$(".action-btn").on("mouseout", (event) =>
{
    setTimeout(() =>
    {
        $(".action-btn").removeClass("btn-hovered");

        $(".floating-btn-txt").addClass("hidden");

        $(".action-btn i").removeClass("hidden");
    }, 1000);
});