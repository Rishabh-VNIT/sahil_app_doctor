"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Database, Server, Code, Terminal, ExternalLink } from "lucide-react"

export default function MERNStackIntro() {
    const [activeTab, setActiveTab] = useState("overview")
    const [users, setUsers] = useState(["John Doe", "Jane Smith"])
    const [newUser, setNewUser] = useState("")

    const addUser = () => {
        if (newUser.trim()) {
            setUsers([...users, newUser.trim()])
            setNewUser("")
        }
    }

    return (
        <div className="container mx-auto p-4 space-y-8 max-w-4xl">
            <h1 className="text-4xl font-bold text-center mb-8">MERN Stack Introduction</h1>

            <Card className="mb-8">
                <CardHeader>
                    <CardTitle>What is MERN Stack?</CardTitle>
                    <CardDescription>
                        MERN Stack is a popular web development framework that combines four key technologies:
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <ul className="list-disc list-inside space-y-2">
                        <li>
                            <strong>MongoDB:</strong> A NoSQL database
                        </li>
                        <li>
                            <strong>Express.js:</strong> A web application framework for Node.js
                        </li>
                        <li>
                            <strong>React:</strong> A JavaScript library for building user interfaces
                        </li>
                        <li>
                            <strong>Node.js:</strong> A JavaScript runtime built on Chrome's V8 JavaScript engine
                        </li>
                    </ul>
                </CardContent>
            </Card>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="mongodb">MongoDB</TabsTrigger>
                    <TabsTrigger value="express">Express.js</TabsTrigger>
                    <TabsTrigger value="react">React</TabsTrigger>
                    <TabsTrigger value="nodejs">Node.js</TabsTrigger>
                </TabsList>

                <TabsContent value="overview">
                    <Card>
                        <CardHeader>
                            <CardTitle>MERN Stack Architecture</CardTitle>
                            <CardDescription>How the components work together</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col items-center space-y-4">
                                <div className="bg-blue-100 p-4 rounded-lg w-full text-center">
                                    <Code className="inline-block mr-2" /> React (Frontend)
                                </div>
                                <div className="text-2xl">↕️</div>
                                <div className="bg-green-100 p-4 rounded-lg w-full text-center">
                                    <Server className="inline-block mr-2" /> Express.js (Backend API)
                                </div>
                                <div className="text-2xl">↕️</div>
                                <div className="bg-yellow-100 p-4 rounded-lg w-full text-center">
                                    <Terminal className="inline-block mr-2" /> Node.js (Runtime Environment)
                                </div>
                                <div className="text-2xl">↕️</div>
                                <div className="bg-purple-100 p-4 rounded-lg w-full text-center">
                                    <Database className="inline-block mr-2" /> MongoDB (Database)
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="mongodb">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Database className="mr-2" /> MongoDB
                            </CardTitle>
                            <CardDescription>NoSQL database for storing application data</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <h3 className="text-lg font-semibold mb-2">Sample Document</h3>
                            <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto">
                {`
{
  "_id": ObjectId("507f1f77bcf86cd799439011"),
  "name": "John Doe",
  "email": "john@example.com",
  "age": 30,
  "created_at": ISODate("2023-05-15T10:00:00Z")
}
                `}
              </pre>
                            <h3 className="text-lg font-semibold mt-4 mb-2">Key Features</h3>
                            <ul className="list-disc list-inside">
                                <li>Document-oriented and schema-less</li>
                                <li>High performance and scalability</li>
                                <li>Supports complex queries and indexing</li>
                            </ul>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="express">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Server className="mr-2" /> Express.js
                            </CardTitle>
                            <CardDescription>Web application framework for Node.js</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <h3 className="text-lg font-semibold mb-2">Sample Code</h3>
                            <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto">
                {`
const express = require('express');
const app = express();
const port = 3000;

app.get('/api/users', (req, res) => {
  res.json([
    { id: 1, name: 'John Doe' },
    { id: 2, name: 'Jane Smith' }
  ]);
});

app.listen(port, () => {
  console.log(\`Server running at http://localhost:\${port}\`);
});
                `}
              </pre>
                            <h3 className="text-lg font-semibold mt-4 mb-2">Key Features</h3>
                            <ul className="list-disc list-inside">
                                <li>Minimal and flexible web application framework</li>
                                <li>Robust set of features for web and mobile applications</li>
                                <li>Easy integration with various templating engines</li>
                            </ul>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="react">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Code className="mr-2" /> React
                            </CardTitle>
                            <CardDescription>JavaScript library for building user interfaces</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="bg-gray-100 p-4 rounded-md">
                                <h3 className="text-lg font-semibold mb-2">Interactive Demo: User List</h3>
                                <ul className="space-y-2 mb-4">
                                    {users.map((user, index) => (
                                        <li key={index} className="bg-white p-2 rounded shadow">
                                            {user}
                                        </li>
                                    ))}
                                </ul>
                                <div className="flex space-x-2">
                                    <Input value={newUser} onChange={(e) => setNewUser(e.target.value)} placeholder="Enter name" />
                                    <Button onClick={addUser}>Add User</Button>
                                </div>
                            </div>
                            <h3 className="text-lg font-semibold mt-4 mb-2">Key Features</h3>
                            <ul className="list-disc list-inside">
                                <li>Component-based architecture</li>
                                <li>Virtual DOM for efficient updates</li>
                                <li>Rich ecosystem and community support</li>
                            </ul>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="nodejs">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Terminal className="mr-2" /> Node.js
                            </CardTitle>
                            <CardDescription>JavaScript runtime built on Chrome's V8 JavaScript engine</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <h3 className="text-lg font-semibold mb-2">Sample Server Code</h3>
                            <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto">
                {`
const http = require('http');

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end('Hello, MERN Stack!');
});

server.listen(3000, 'localhost', () => {
  console.log('Server running at http://localhost:3000/');
});
                `}
              </pre>
                            <h3 className="text-lg font-semibold mt-4 mb-2">Key Features</h3>
                            <ul className="list-disc list-inside">
                                <li>Asynchronous and event-driven</li>
                                <li>Fast execution and scalability</li>
                                <li>Large ecosystem of packages (npm)</li>
                            </ul>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            <Card>
                <CardHeader>
                    <CardTitle>Learn More</CardTitle>
                    <CardDescription>Explore these resources to deepen your understanding of the MERN stack</CardDescription>
                </CardHeader>
                <CardContent>
                    <ul className="space-y-2">
                        <li>
                            <a
                                href="https://www.mongodb.com/mern-stack"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-500 hover:underline flex items-center"
                            >
                                MERN Stack Explained <ExternalLink className="ml-1 h-4 w-4" />
                            </a>
                        </li>
                        <li>
                            <a
                                href="https://developer.mozilla.org/en-US/docs/Learn/Server-side/Express_Nodejs/Introduction"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-500 hover:underline flex items-center"
                            >
                                MDN Web Docs: Express/Node introduction <ExternalLink className="ml-1 h-4 w-4" />
                            </a>
                        </li>
                        <li>
                            <a
                                href="https://reactjs.org/tutorial/tutorial.html"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-500 hover:underline flex items-center"
                            >
                                React Official Tutorial <ExternalLink className="ml-1 h-4 w-4" />
                            </a>
                        </li>
                    </ul>
                </CardContent>
            </Card>
        </div>
    )
}

