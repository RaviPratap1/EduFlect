import React from "react";
import { Link } from "react-router-dom";
import {
  Users,
  BookOpen,
  Award,
  Target,
  CheckCircle,
} from "lucide-react";

export default function AboutPage() {
  const stats = [
    {
      icon: Users,
      value: "10K+",
      title: "Students",
    },
    {
      icon: BookOpen,
      value: "200+",
      title: "Courses",
    },
    {
      icon: Award,
      value: "50+",
      title: "Expert Mentors",
    },
    {
      icon: Target,
      value: "4.8★",
      title: "Average Rating",
    },
  ];

  const features = [
    "Industry Expert Instructors",
    "Real-world Project Based Learning",
    "Flexible Learning Experience",
    "Certificates After Completion",
  ];

  return (
    <div className="bg-gray-50">

      {/* Hero */}

      <section className="relative overflow-hidden text-white bg-gradient-to-br from-indigo-900 via-primary-700 to-purple-800">

        <div className="absolute inset-0 opacity-20">

          <div className="absolute top-0 left-0 bg-pink-500 rounded-full h-72 w-72 blur-3xl"></div>

          <div className="absolute bottom-0 right-0 bg-blue-500 rounded-full h-72 w-72 blur-3xl"></div>

        </div>

        <div className="relative px-6 py-24 mx-auto max-w-7xl">

          <div className="grid items-center gap-12 lg:grid-cols-2">

            <div>

              <span className="px-4 py-2 text-sm rounded-full bg-white/20">

                🚀 About EduFlect

              </span>

              <h1 className="mt-6 text-5xl font-extrabold leading-tight lg:text-6xl">

                Transforming Learning Into

                <span className="block text-yellow-300">

                  Career Success

                </span>

              </h1>

              <p className="mt-6 text-lg text-gray-200">

                Learn practical skills from industry experts with
                real projects and hands-on experience.

              </p>

              <Link
                to="/courses"
                className="inline-block px-8 py-3 mt-8 font-semibold text-indigo-700 duration-300 bg-white rounded-xl hover:scale-105"
              >

                Explore Courses

              </Link>

            </div>

            <div className="grid grid-cols-2 gap-5">

              {stats.map((item) => {

                const Icon = item.icon;

                return (

                  <div
                    key={item.title}
                    className="p-6 duration-300 border bg-white/10 backdrop-blur-lg rounded-3xl hover:-translate-y-2 border-white/10"
                  >

                    <Icon className="mb-4 text-yellow-300"/>

                    <h2 className="text-3xl font-bold">

                      {item.value}

                    </h2>

                    <p className="text-gray-200">

                      {item.title}

                    </p>

                  </div>

                );
              })}

            </div>

          </div>

        </div>

      </section>

      {/* Mission */}

      <section className="py-20">

        <div className="px-6 mx-auto max-w-7xl">

          <div className="grid gap-10 lg:grid-cols-2">

            <div className="p-8 duration-300 bg-white shadow-lg rounded-3xl hover:shadow-2xl">

              <h2 className="mb-6 text-3xl font-bold">

                Our Mission

              </h2>

              <p className="leading-8 text-gray-600">

                Our mission is to make high-quality education
                accessible to everyone through practical,
                project-based learning experiences.

              </p>

            </div>

            <div className="p-8 duration-300 bg-white shadow-lg rounded-3xl hover:shadow-2xl">

              <h2 className="mb-6 text-3xl font-bold">

                Why Students Choose Us

              </h2>

              <div className="space-y-4">

                {features.map((item) => (

                  <div
                    key={item}
                    className="flex items-center gap-3"
                  >

                    <CheckCircle
                      className="text-green-500"
                    />

                    <span>

                      {item}

                    </span>

                  </div>

                ))}

              </div>

            </div>

          </div>

        </div>

      </section>

      {/* CTA */}

      <section className="py-20">

        <div className="max-w-5xl px-6 mx-auto">

          <div className="bg-gradient-to-r from-primary-600 to-indigo-700 rounded-[40px] text-white p-12 text-center">

            <h1 className="text-4xl font-bold">

              Start Your Learning Journey Today

            </h1>

            <p className="mt-4 text-gray-200">

              Join thousands of learners already growing with EduFlect

            </p>

            <Link
              to="/register"
              className="inline-block px-8 py-3 mt-8 font-semibold text-indigo-700 duration-300 bg-white rounded-xl hover:scale-105"
            >

              Get Started

            </Link>

          </div>

        </div>

      </section>

    </div>
  );
}