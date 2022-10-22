const { ObjectId } = require("mongodb");

//                  About threads
async function createThread(collection, board, text, delete_password, _id) {
  const date = new Date();
  const thread = await collection.create({
    text: text,
    _id: _id,
    board: board,
    created_on: date,
    bumped_on: date,
    reported: false,
    delete_password: delete_password,
    replies: [],
  });

  return;
}

async function getThreads(collection, board) {
  // Get the threads from the collection
  let threads = await collection
    .find({ board: board })
    .select("-reported -delete_password -__v")
    .sort("-bumped_on")
    .lean(true);

  return threads
    .reduce((threadsArr, thread) => {
      // Only taking the first three replies
      thread.replies = thread.replies.slice(3);

      // Clean out reported and delete_password from replies+
      thread.replies.forEach((reply) => {
        delete reply.delete_password;
        delete reply.reported;
      });

      // Pushing the final thread to the result-array
      threadsArr.push(thread);

      return threadsArr;
    }, [])
    .slice(0, 10);
}

async function reportThread(collection, board, thread_id) {
  // Avoiding mongoose cast Error
  try {
    ObjectId(thread_id);
  } catch (error) {
    console.log("Invalid password");
    return "Unreported";
  }

  const thread = await collection.findOneAndUpdate(
    { board: board, _id: ObjectId(thread_id) },
    { reported: true }
  );

  if (!thread) {
    console.log("Invalid password or No such thread !");
  }
  return "reported";
}

async function deleteThread(collection, board, thread_id, delete_password) {
  try {
    const result = await collection.deleteOne({
      board: board,
      _id: thread_id,
      delete_password: delete_password,
    });

    return result.deleteCount ? "success" : "incorrect password";
  } catch {
    return "No such Thread !";
  }
}

//                        About replies

async function createReply(
  collection,
  board,
  thread_id,
  text,
  delete_password,
  _id
) {
  // Considered to be the comment's date
  const date = new Date();
  // thread_id validation
  try {
    ObjectId(thread_id);
  } catch {
    return "Invalid thread_id";
  }

  // Find the thread in the db's collection using it's _id
  const thread = await collection.findOne({
    board: board,
    _id: ObjectId(thread_id),
  });

  // Creation of the reply in the replies array
  try {
    thread._doc.replies.push({
      text: text,
      _id: _id,
      created_on: date,
      delete_password: delete_password,
      reported: false,
    });
  } catch {
    return "No such thread !";
  }

  thread.$isNew = true;

  thread.bumped_on = date;

  // Save the updated thread
  return await thread.save(function (err, result) {
    return;
  });
}

async function getReplies(collection, board, thread_id) {
  // Id validation , otherwise going to throw a mongodb cast ERROR !
  try {
    ObjectId(thread_id);
  } catch {
    return "Invalid thread_id !";
  }

  const thread = await collection
    .findOne({ board: board, _id: ObjectId(thread_id) })
    .lean(true);
  const { replies } = thread;
  replies.forEach((reply) => {
    delete reply.delete_password;
    delete reply.reported;
  });

  return replies;
}

async function reportReply(collection, board, thread_id, reply_id) {
  const thread = await collection.findOne({ board: board, _id: thread_id });

  if (thread) {
    const replyIndex = thread._doc.replies.findIndex(
      (reply) => reply._id == reply_id
    );
    if (replyIndex == -1) {
      return "No such reply";
    }

    // const newReply = Object.assign({}, thread._doc.replies[replyIndex]);
    // newReply.reported = true;
    // thread.replies[replyIndex] = newReply;
    thread.replies[replyIndex].reported = true;
    thread.$__.$isNew = true;
  }
  await thread.save(function (err, result) {
    return;
  });

  return "reported";
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
