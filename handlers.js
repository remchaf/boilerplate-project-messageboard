const { ObjectId } = require("mongodb");

//                  About threads
async function createThread(collection, board, text, delete_password, _id) {
  console.log("Mbayame Ndiaye");
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
  let threads = await collection
    .find({})
    .select("-reported -delete_password -__v")
    .lean(true);

  // Sort the threads regarding of their bumped_on value
  threads = threads
    .sort((thread1, thread2) => thread1.bumped_on - thread2.bumped_on)
    .slice(0, 10);

  // Clean out reported and delete_password from threads
  return threads.reduce((threadsArr, thread) => {
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

    return result ? "success" : "incorrect password";
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
  delete_password
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
  // Id validation , otherwise going to throw a mongodb cast ERROR !
  try {
    ObjectId(thread_id);
  } catch {
    return "Invalid thread_id !";
  }

  const { replies } = await collection
    .findOne({ board: board, _id: ObjectId(thread_id) })
    .lean(true)
    .select("replies -_id");
  replies.forEach((reply) => {
    delete reply.delete_password;
    delete reply.reported;
  });

  return replies;
}

async function reportReply(collection, board, thread_id, reply_id) {
  const thread = await collection.findOneAndUpdate(
    { board: board, _id: thread_id, "replies._id": reply_id },
    { $set: { "replies.$.reported": true } }
  );

  console.log(thread);

  // if (thread) {
  //   const replyIndex = thread._doc.replies.findIndex(
  //     (reply) => reply._id == reply_id
  //   );
  //   if (replyIndex == -1) {
  //     return "No such reply";
  //   }

  //   thread._doc.replies[replyIndex].reported = true;
  //   console.log(thread._doc.replies[replyIndex].reported);
  // }
  // await thread.save(function(err, result) {
  //   if(err) {
  //     console.log(err.message)
  //   }
  //   console.log(result)
  // });
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
