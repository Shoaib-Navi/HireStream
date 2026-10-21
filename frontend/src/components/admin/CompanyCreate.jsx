import React, { useState } from "react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useDispatch } from "react-redux";
import { setSingleCompany } from "@/redux/companySlice";
import api, { getErrorMessage } from "@/lib/api";

const CompanyCreate = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [companyName, setCompanyName] = useState("");
  const [loading, setLoading] = useState(false);

  const registerNewCompany = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await api.post("/company/register", { companyName });
      dispatch(setSingleCompany(res.data.company));
      toast.success(res.data.message);
      navigate(`/admin/companies/${res.data.company._id}`);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={registerNewCompany} className="max-w-4xl mx-auto px-4">
      <div className="my-10">
        <h1 className="font-bold text-2xl">Your Company Name</h1>
        <p className="text-gray-500">
          What would you like to give your company name? You can change this
          later.
        </p>
      </div>

      <Label htmlFor="companyName">Company Name</Label>
      <Input
        id="companyName"
        type="text"
        className="my-2"
        placeholder="HireStream ,Microsoft etc"
        value={companyName}
        onChange={(e) => setCompanyName(e.target.value)}
      />
      <div className="flex items-center gap-2 my-10">
        <Button type="button" variant="outline" onClick={() => navigate("/admin/companies")}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Please wait..." : "Continue"}
        </Button>
      </div>
    </form>
  );
};

export default CompanyCreate;
