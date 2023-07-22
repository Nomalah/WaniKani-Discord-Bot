import fetch from 'node-fetch';

export const getName = async (token) => {
    let jsonResult = await fetch("https://api.wanikani.com/v2/user", {
        headers: { "Authorization": "Bearer " + token }
    }).then(response => response.json());
    return jsonResult["data"]["username"];
};

export const statsForDay = async (token) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let reviewsCompleted = (await fetch(`https://api.wanikani.com/v2/reviews?updated_after=${today.toISOString()}`, {
        headers: { "Authorization": "Bearer " + token }
    }).then(response => response.json()))["total_count"];
    
    let reviewsPending = (await fetch(`https://api.wanikani.com/v2/assignments?immediately_available_for_review`, {
        headers: { "Authorization": "Bearer " + token }
    }).then(response => response.json()))["total_count"];
    
    let lessonsCompleted = (await fetch(`https://api.wanikani.com/v2/assignments?updated_after=${today.toISOString()}&started=true`, {
        headers: { "Authorization": "Bearer " + token }
    }).then(response => response.json()))["data"].reduce((t, assignment) => t + (today <= new Date(assignment["data"]["started_at"])), 0);
    
    let lessonsPending = (await fetch(`https://api.wanikani.com/v2/assignments?immediately_available_for_lessons`, {
        headers: { "Authorization": "Bearer " + token }
    }).then(response => response.json()))["total_count"];
    
    return {    
        "reviewsCompleted": reviewsCompleted,
        "reviewsPending": reviewsPending,
        "lessonsCompleted": lessonsCompleted,
        "lessonsPending": lessonsPending
    };
}

