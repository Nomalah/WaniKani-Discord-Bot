export async function getUser(token) {
    let jsonResult = await fetch("https://api.wanikani.com/v2/user", {
        headers: { "Authorization": "Bearer " + token }
    }).then(response => response.json());
    return jsonResult.data;
};

export async function getSubjects(token) {
    const subjects = {};
    let next_url = "https://api.wanikani.com/v2/subjects";
    while (next_url) {
        let fetched_subjects = await fetch(next_url, {
            headers: { "Authorization": "Bearer " + token }
        }).then(response => response.json());
        // console.log(fetched_subjects)
        for (const subject of fetched_subjects.data) {
            subjects[subject.id] = subject.data;
        }
        next_url = fetched_subjects.pages.next_url;
    }
    return subjects;
}

export const statsForDay = async (token) => {
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    let reviewsCompleted = (await fetch(`https://api.wanikani.com/v2/assignments?updated_after=${yesterday.toISOString()}&in_review`, {
        headers: { "Authorization": "Bearer " + token }
    }).then(response => response.json()))["total_count"];
    
    let reviewsPending = (await fetch(`https://api.wanikani.com/v2/assignments?immediately_available_for_review`, {
        headers: { "Authorization": "Bearer " + token }
    }).then(response => response.json()))["total_count"];
    
    let lessonsCompleted = (await fetch(`https://api.wanikani.com/v2/assignments?updated_after=${yesterday.toISOString()}&started=true`, {
        headers: { "Authorization": "Bearer " + token }
    }).then(response => response.json()))["data"].reduce((t, assignment) => t + (yesterday <= new Date(assignment["data"]["started_at"])), 0);
    
    let lessonsPending = (await fetch(`https://api.wanikani.com/v2/assignments?immediately_available_for_lessons`, {
        headers: { "Authorization": "Bearer " + token }
    }).then(response => response.json()))["total_count"];

    return {    
        reviewsCompleted,
        reviewsPending,
        lessonsCompleted,
        lessonsPending,
    };
}

