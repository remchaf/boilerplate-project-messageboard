// About threads
async function createThread(collection, board, text, delete_password, _id) {
  const date = new Date();
  const thread = await collection.create({
    _id: _id,
    text: text,
    board: board,
    created_on: date,
    bumped_on: date,
    reported: false,
    delete_password: delete_password,
    replies: [],
  });

  return thread;
}

async function getThreads(collection, board) {
  // Get the threads from the collection
  const threads = await collection.find({}).lean(true); // or .select('-reported -delete_password').lean(true);

  // Sort the threads regarding of their bumped_on value
  threads = threads
    .sort((thread1, thread2) => thread1.bumped_on - thread2.bumped_on)
    .slice(10);

  // Clean out reported and delete_password from threads
  return threads.reduce((thread, threadsArr) => {
    // Cleaning
    delete thread.reported;
    delete thread.delete_password;

    // Sort the replies by create_on date value
    thread.replies = thread.replies
      .sort((reply1, reply2) => reply1.created_on - reply2.created_on)
      .slice(3);

    // Only taking the first three replies
    threadsArr.push(thread);

    return threadsArr;
  }, []);
}

async function reportThread(collection, board, thread_id) {
  const thread = await collection.findOne({ board: board, _id: thread_id });

  if (thread) {
    thread.reported = true;
    await thread.save();
  }
  return "reported";
}

async function deleteThread(collection, board, thread_id, delete_password) {
  const result = await collection.deleteOne({
    board: board,
    _id: thread_id,
    delete_password: delete_password,
  });

  return result ? "success" : "incorrect password";
}

// About replies
async function createReply(collection, text, delete_password, thread_id, _id) {
  // Considerd to be the comment's date
  const date = new Date();

  // Find the thread in the db's collection using it's _id
  const thread = await collection.findOne({ _id: thread_id });

  // Creation of the reply in the replies array
  thread._doc.replies.push({
    _id: _id,
    text: text,
    created_on: date,
    delete_password: delete_password,
    reported: false,
  });

  thread.bumped_on = date;

  // Save the updated thread
  return await thread.save();
}

async function getReplies(collection, board, thread_id) {
  const replies = await collection
    .find({ board: board, _id: thread_id })
    .select("replies");
  replies = replies.replies;

  return replies.reduce((reply, repliesArr) => {
    // Filter out the unwanted fields to be sent to the client
    delete reply.reported;
    delete reply.delete_password;

    repliesArr.push(reply);
    return repliesArr;
  }, []);
}

async function reportReply(collection, board, thread_id, reply_id) {
  const reply = await collection.findOne({ board: board, _id: thread_id });

  if (reply) {
    const replyIndex = reply.findIndex((reply) => reply._id == reply_id);
    if (replyIndex == -1) {
      return "No such reply";
    }

    reply[replyIndex].reported = true;
    await reply.save();
    return "reported";
  }
}

async function deleteReply(
  collection,
  board,
  thread_id,
  reply_id,
  delete_password
) {
  const result = await collection.findOne({ board: board, _id: thread_id });

  if (!result) {
    return "No such thread";
  }

  const replies = result.replies;
  const indx = replies.findIndex(
    (reply) => reply._id == reply_id && reply.delete_password == delete_password
  );
  if (indx == -1) {
    return "incorrect password";
  }

  replies[indx] = "deleted";
  await result.save();
  return "success";
}

module.exports = {
  createThread,
  getThreads,
  reportThread,
  deleteThread,
  createReply,
  getReplies,
  reportReply,
  deleteReply,
};
