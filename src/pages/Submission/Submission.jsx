// src/components/SubmissionDetail.tsx

import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase-config";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faHeart, faComment, faCalendarAlt, faUser } from "@fortawesome/free-solid-svg-icons";

export default function SubmissionDetail() {
  const { submissionId } = useParams();
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchSubmission() {
      try {
        const docRef = doc(db, "submissions", submissionId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setSubmission({
            id: docSnap.id,
            ...data,
            createdAt: data.createdAt?.toDate() || new Date(),
            likesCount: data.likes?.likesCount || 0,
            commentsCount: data.comments?.commentsCount || 0,
          });
        } else {
          setError("Submission not found.");
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load submission.");
      } finally {
        setLoading(false);
      }
    }

    fetchSubmission();
  }, [submissionId]);

  if (loading) {
    return (
      <main className="max-w-4xl mx-auto p-8 text-white">
        <p>Loading submission...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="max-w-4xl mx-auto p-8 text-red-400">
        <p>{error}</p>
      </main>
    );
  }

  return (
    <main className="max-w-4xl mx-auto p-8 rounded-3xl shadow-2xl bg-gradient-to-br from-purple-800 via-pink-800 to-purple-900 my-12 text-white">
      <Link to="/gallery" className="text-pink-300 hover:underline mb-4 inline-block">
        <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
        Back to Gallery
      </Link>

      <div className="flex flex-col md:flex-row gap-8">
        <div className="md:w-1/2">
          <img
            src={submission.imageUrl}
            alt={submission.prompt}
            className="rounded-xl shadow-xl w-full object-cover"
          />
        </div>

        <div className="md:w-1/2 flex flex-col gap-4">
          <h2 className="text-3xl font-bold">{submission.prompt}</h2>
          <p className="text-sm text-pink-300 italic">
            Challenge: {submission.challengeId}
          </p>
          <div className="flex items-center gap-2 text-pink-200">
            <FontAwesomeIcon icon={faUser} />
            {submission.userDisplayName}
          </div>
          <div className="flex items-center gap-2 text-pink-200">
            <FontAwesomeIcon icon={faCalendarAlt} />
            {new Date(submission.createdAt).toLocaleString()}
          </div>

          <div className="flex gap-4 text-pink-300 mt-4">
            <div className="flex items-center gap-2">
              <FontAwesomeIcon icon={faHeart} />
              {submission.likesCount}
            </div>
            <div className="flex items-center gap-2">
              <FontAwesomeIcon icon={faComment} />
              {submission.commentsCount}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
